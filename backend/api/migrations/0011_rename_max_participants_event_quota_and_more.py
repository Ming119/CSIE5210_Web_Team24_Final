# Generated by Django 5.2.1 on 2025-05-25 19:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_event_fee'),
    ]

    operations = [
        migrations.RenameField(
            model_name='event',
            old_name='max_participants',
            new_name='quota',
        ),
        migrations.RemoveField(
            model_name='event',
            name='is_public',
        ),
        migrations.AddField(
            model_name='event',
            name='status',
            field=models.CharField(choices=[('planning', '規劃中'), ('ongoing', '進行中'), ('completed', '已結束')], default='planning', max_length=20),
        ),
    ]
