from django.db.models import Count, Q
from django.shortcuts import render, redirect
from django.contrib.auth import logout
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.forms.models import model_to_dict
from django.core.exceptions import ObjectDoesNotExist

from Urban.models import Mark, Profile
from django.contrib.auth.models import User

import math
from datetime import date


def index(request):
    if request.user.is_authenticated():
        try:
            user_profile = Profile.objects.get(user=request.user)
        except ObjectDoesNotExist:
            user_profile = Profile()
            user_profile.user = request.user
            user_profile.save()

        return render(request, "success.html", {"user": request.user, "profile": user_profile})

    if request.user_agent.is_mobile:
        return render(request, "mobile_index.html")
        
    return render(request, "index.html")


def analytics(request):
    return render(request, "analytics.html")


# Used during social registration/login
def save_extra_user_data(backend, user, response, *args, **kwargs):
    GENDERS = {
        "unknown": 0,
        "female": 1,
        "male": 2
    }

    profile_img = None
    gender = None
    dob = None

    need_to_save = False

    if backend.name == "vk-oauth2":
        vk_user_id = str(response.get("user_id"))
        fields = "sex,bdate"
        access_token = str(response.get("access_token"))

        data = backend.get_json(
            "https://api.vk.com/method/users.get?users_id=" + vk_user_id +
            "&v=5.73" +
            "&fields=" + fields +
            "&access_token=" + access_token
        )

        data = data["response"][0]

        gender = data.get("sex")
        profile_img = response.get("photo")
        dob_data = data.get("bdate")
        if dob_data:
            dob_data = dob_data.split(".")
            dob = date(int(dob_data[2]), int(dob_data[1]), int(dob_data[0]))

        need_to_save = True

    if backend.name == "google-oauth2":
        profile_img = response["image"].get("url")

        gender_string = "unknown" if response.get("gender") is None else response.get("gender")
        gender = GENDERS[gender_string]

        dob_data = response.get("birthday")
        if dob_data:
            dob_data = dob_data.split("-")
            dob = date(int(dob_data[0]), int(dob_data[1]), int(dob_data[2]))

        need_to_save = True

    if backend.name == "facebook":
        facebook_user_id = str(response.get("id"))
        access_token = str(response.get("access_token"))

        data = backend.get_json(
            "https://graph.facebook.com/v2.12/{}?access_token={}&fields=name,gender,picture,birthday".format(facebook_user_id, access_token)
        )

        gender_string = "unknown" if data.get("gender") is None else data.get("gender")
        gender = GENDERS[gender_string]

        profile_img = data.get("picture").get("data").get("url")
        dob_data = data.get("birthday")

        if dob_data:
            dob_data = dob_data.split('/')
            dob = date(int(dob_data[0]), int(dob_data[1]), int(dob_data[2]))

        need_to_save = True

    if need_to_save:
        try:
            profile = Profile.objects.get(user=user)
        except ObjectDoesNotExist:
            profile = Profile()

        profile.gender = gender
        profile.img_url = profile_img
        profile.dob = dob
        profile.user = user
        profile.save()


@csrf_exempt
def mark(request):
    if request.user.is_authenticated():
        if request.method == 'GET':
            # Return marker
            try:
                marker = Mark.objects.get(id=request.GET.get("id"))
                return JsonResponse({'marker': model_to_dict(marker)}, status=200)
            except ObjectDoesNotExist:
                return HttpResponse("", status=404)

        elif request.method == 'POST':
            # Save created marker
            lat = request.POST.get("lat")
            lng = request.POST.get("lng")
            text = request.POST.get("text")
            marker_type = request.POST.get("type")

            marker = Mark(lat=lat, lng=lng, text=text, type=marker_type, user=request.user)
            marker.save()

            return JsonResponse({'marker': model_to_dict(marker)}, status=200)

        return HttpResponse("", status=404)
    return HttpResponse("", status=403)


@csrf_exempt
def marks_all(request):
    if request.method == 'GET':
        # Return all markers

        usage = False
        if request.GET.get("self") and request.GET.get("self") == 'true':
            usage = True

        marker_type = request.GET.get("type")

        if usage:
            # If user requested only his markers
            if request.user.is_authenticated():
                if marker_type:
                    markers = Mark.objects.filter(user=request.user, type=marker_type)
                else:
                    markers = Mark.objects.filter(user=request.user)
            else:
                HttpResponse("", status=401)
        else:
            bounds = [float(i) for i in request.GET.getlist('bounds[]')]

            # Else return all. First, checking if bounds are set.
            if len(bounds) > 0:
                if marker_type and marker_type != "all":
                    markers = Mark.objects.filter(type=marker_type,
                                                  lat__gte = bounds[0],
                                                  lat__lte = bounds[1],
                                                  lng__gte = bounds[2],
                                                  lng__lte = bounds[3])
                else:
                    markers = Mark.objects.filter(lat__gte=bounds[0],
                                                  lat__lte=bounds[1],
                                                  lng__gte=bounds[2],
                                                  lng__lte=bounds[3])
            else:
                if marker_type and marker_type != "all":
                    markers = Mark.objects.filter(type=marker_type)
                else:
                    markers = Mark.objects.all()

        return JsonResponse({'markers': list(markers.values())}, status=200)

    return HttpResponse("", status=404)


@csrf_exempt
def marks_radius(request):
    #----------
    markers = Mark.objects.all()
    marker_type = request.GET.get("type")
    if marker_type and marker_type != "all":
        markers = markers.filter(type=marker_type)
    markers = list(markers.values())
    return JsonResponse({'markers': markers}, status=200)
    #----------
    
    if request.method == 'GET':
        
        radius = float(request.GET.get("radius"))
        lat = float(request.GET.get("lat"))
        lng = float(request.GET.get("lng"))
        
        if request.GET.get("radius") and request.GET.get("lat") and request.GET.get("lng"):
            
            marker_type = request.GET.get("type")

            if marker_type and marker_type != "all":
                markers = Mark.objects.filter(type=marker_type)
            else:
                markers = Mark.objects.all()

            markers = [marker for marker in list(markers.values()) if math.sqrt((marker["lat"] - lat)**2 + (marker["lng"] - lng)**2) <= radius]

            return JsonResponse({'markers': markers}, status=200)

        else:
            return HttpResponse("", status=404)


@csrf_exempt
def mark_delete(request):
    if request.user.is_authenticated():
        if request.method == 'POST':
            try:
                marker = Mark.objects.get(id=request.POST.get('id'))
                if marker.user == request.user:
                    marker.delete()
                    return HttpResponse("", status=200)
                else:
                    return HttpResponse("", status=403)
            except ObjectDoesNotExist:
                return HttpResponse("", status=404)
        return HttpResponse("", status=404)
    return HttpResponse("", status=403)


@csrf_exempt
def mark_update(request):
    if request.user.is_authenticated():
        if request.method == 'POST':
            mid = request.POST.get('id')
            if mid is not None:
                try:
                    marker = Mark.objects.get(id=mid)
                    if request.user != marker.user:
                        return HttpResponse("", status=403)

                    text = request.POST.get('text') if request.POST.get('text') is not None and request.POST.get('text') != '' else marker.text
                    lat = request.POST.get('lat') if request.POST.get('lat') is not None and request.POST.get('lat') != '' else marker.lat
                    lng = request.POST.get('lng') if request.POST.get('lng') is not None and request.POST.get('lng') != '' else marker.lng
                    mtype = request.POST.get('type') if request.POST.get('type') is not None and request.POST.get('type') != '' else marker.type

                    marker.text = text
                    marker.lat = lat
                    marker.lng = lng
                    marker.type = mtype

                    marker.save()
                    return HttpResponse("", status=200)
                except ObjectDoesNotExist:
                    return HttpResponse("", status=404)
            else:
                return HttpResponse("", status=406)

        return HttpResponse("", status=404)
    return HttpResponse("", status=403)


@csrf_exempt
def get_mark_stats(request):
    if request.method == 'GET':
        bounds = [float(i) for i in request.GET.getlist('bounds[]')]

        if len(bounds) == 0:
            data = Mark.objects.values("type").annotate(amount=Count("type"))
        else:
            data = Mark.objects.values("type").filter(lat__gte=bounds[0],
                                                      lat__lte=bounds[1],
                                                      lng__gte=bounds[2],
                                                      lng__lte=bounds[3]).annotate(amount=Count("type"))
            print(data)
        return JsonResponse({'stats': list(data)}, status=200)
    return HttpResponse("", status=404)


@csrf_exempt
def get_comments(request):
    if request.method == 'GET':
        amount = int(request.GET.get('amount'))

        send_data = []
        counter = 0
        data = list(Mark.objects.values().order_by('-id'))
        for i in range(len(data)):
            if (data[i]["text"] is not None) and (data[i]["text"] is not ""):
                send_data.append(data[i])
                user = User.objects.get(id=data[i]["user_id"])
                send_data[counter]["user_id"] = {
                    "id": user.id,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                }

                counter += 1
                if len(send_data) == amount:
                    break
            else:
                continue

        return JsonResponse({'comments': list(send_data)}, status=200)
    return HttpResponse("", status=404)


def logout_user(request):
    logout(request)
    return redirect("/")
