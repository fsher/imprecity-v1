from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class Mark(models.Model):
    type = models.IntegerField('Type', default=0)
    text = models.TextField('Description', null=True)
    lat = models.FloatField('Latitude', default=0.0)
    lng = models.FloatField('Longitude', default=0.0)
    createDate = models.DateTimeField('Create Date', auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=False)
    gender = models.IntegerField('Gender', null=False, default=0, choices=((0, 'Unknown'), (1, 'Female'), (2, 'Male')))
    img_url = models.TextField('Profile Image', null=True)
    dob = models.DateField('Date of Birth', auto_now=False, auto_now_add=False, null=True)

    def __str__(self):
        return self.user.username

    def get_img(self):
        return self.img_url if self.img_url else "/static/img/user.svg"
