from django.contrib import admin
from django.utils.html import format_html

from .models import (Club, Event, EventParticipation, FinanceRecord,
                     Membership, User)


# Custom admin class for User model
class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "is_admin", "name", "contact")
    search_fields = ("username", "email", "name", "contact")
    list_filter = ("is_admin",)


# Custom admin class for Club model with inline Membership editing
class MembershipInline(admin.TabularInline):
    model = Membership
    extra = 1


@admin.action(description="設為已成立")
def make_active(modeladmin, request, queryset):
    queryset.update(status="active")


@admin.action(description="設為待審核")
def make_pending(modeladmin, request, queryset):
    queryset.update(status="pending")


@admin.action(description="設為已拒絕")
def make_rejected(modeladmin, request, queryset):
    queryset.update(status="rejected")


@admin.action(description="設為暫停營運")
def make_suspended(modeladmin, request, queryset):
    queryset.update(status="suspended")


@admin.action(description="設為已解散")
def make_disbanded(modeladmin, request, queryset):
    queryset.update(status="disbanded")


class ClubAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "description",
        "max_member",
        "status",
        "foundation_date",
        "image_tag",
    )
    search_fields = ("name",)
    inlines = [MembershipInline]
    actions = [make_active, make_pending, make_rejected, make_suspended, make_disbanded]
    fields = ("name", "description", "max_member", "status", "foundation_date", "image")
    readonly_fields = ("foundation_date", "image_tag")
    fields = (
        "name",
        "description",
        "max_member",
        "status",
        "foundation_date",
        "image",
        "image_tag",
    )

    def image_tag(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width:80px;height:80px;object-fit:cover;" />',
                obj.image.url,
            )
        return "-"

    image_tag.short_description = "圖片"


# Custom admin class for Membership model
class MembershipAdmin(admin.ModelAdmin):
    list_display = ("user", "club", "is_manager")
    list_filter = ("is_manager",)
    search_fields = ("user__username", "club__name")


# Custom admin class for Event model
class EventAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "club",
        "start_date",
        "end_date",
        "fee",
        "quota",
        "status",
        "is_public",
        "payment_methods",
    )
    list_filter = ("status", "club", "start_date", "end_date", "is_public")
    search_fields = ("name", "club__name", "description")
    fields = (
        "name",
        "club",
        "description",
        "status",
        "start_date",
        "end_date",
        "fee",
        "quota",
        "is_public",
        "payment_methods",
    )

    def get_readonly_fields(self, request, obj=None):
        # payment_methods is readonly if fee is 0 (free event)
        if obj and obj.fee == 0:
            return super().get_readonly_fields(request, obj) + ("payment_methods",)
        return super().get_readonly_fields(request, obj)


# Custom admin class for EventParticipation model
class EventParticipationAdmin(admin.ModelAdmin):
    list_display = ("user", "event")
    search_fields = ("user__username", "event__name")


# Custom admin class for FinanceRecord model
class FinanceRecordAdmin(admin.ModelAdmin):
    list_display = ("club", "amount", "date", "description")
    list_filter = ("club", "date")
    search_fields = ("description",)


# Register models with their custom admin classes
admin.site.register(User, UserAdmin)
admin.site.register(Club, ClubAdmin)
admin.site.register(Membership, MembershipAdmin)
admin.site.register(Event, EventAdmin)
admin.site.register(EventParticipation, EventParticipationAdmin)
admin.site.register(FinanceRecord, FinanceRecordAdmin)
