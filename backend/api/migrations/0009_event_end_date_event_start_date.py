# Generated by Django 5.2.1 on 2025-05-25 19:24

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_alter_club_max_member'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='end_date',
            field=models.DateField(default=datetime.date(2025, 5, 25)),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='event',
            name='start_date',
            field=models.DateField(default=datetime.date(2025, 5, 25)),
            preserve_default=False,
        ),
    ]
