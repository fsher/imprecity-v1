# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2017-08-30 09:41
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Urban', '0002_auto_20170830_0924'),
    ]

    operations = [
        migrations.AddField(
            model_name='mark',
            name='lat',
            field=models.FloatField(default=0.0, verbose_name='Latitude'),
        ),
        migrations.AddField(
            model_name='mark',
            name='lon',
            field=models.FloatField(default=0.0, verbose_name='Longitude'),
        ),
    ]
