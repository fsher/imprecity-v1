from django.conf.urls import include, url
from django.views.generic import TemplateView
from . import views

urlpatterns = [
    url(r'^$', views.index, name="index"),
    url(r'^analytics$', views.analytics, name="analytics"),
    url(r'^api/logout$', views.logout_user, name="logout_api"),
    url(r'^api/mark$', views.mark, name="mark_api"),
    url(r'^api/mark/delete$', views.mark_delete, name="mark_api_delete"),
    url(r'^api/mark/update', views.mark_update, name="mark_api_update"),
    url(r'^api/mark/all$', views.marks_all, name="mark_api_all"),
    url(r'^api/mark/radius$', views.marks_radius, name="mark_api_radius"),
    url(r'^api/mark/stats$', views.get_mark_stats, name="mark_api_stats"),
    url(r'^api/mark/comments$', views.get_comments, name="mark_api_comments"),
    url(r'^social/', include('social_django.urls', namespace='social')),
    url(r'^termofuse/', TemplateView.as_view(template_name='term_of_use.html'), name='term of use'),
    url(r'^politics/', TemplateView.as_view(template_name='politics.html'), name='politics'),
]