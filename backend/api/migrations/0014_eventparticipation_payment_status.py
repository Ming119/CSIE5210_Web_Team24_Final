# Generated by Django 5.2.1 on 2025-05-26 12:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0013_eventparticipation_payment_method'),
    ]

    operations = [
        migrations.AddField(
            model_name='eventparticipation',
            name='payment_status',
            field=models.CharField(choices=[('pending', '待確認'), ('confirmed', '已確認')], default='pending', max_length=20),
        ),
    ]
