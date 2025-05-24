from django.contrib import admin
from .models import User, Club, Membership, Event, EventParticipation, FinanceRecord

# Custom admin class for User model
class UserAdmin(admin.ModelAdmin):
  list_display = ('username', 'email', 'is_admin')
  search_fields = ('username', 'email')
  list_filter = ('is_admin',)

# Custom admin class for Club model with inline Membership editing
class MembershipInline(admin.TabularInline):
  model = Membership
  extra = 1

class ClubAdmin(admin.ModelAdmin):
  list_display = ('name', 'description')
  search_fields = ('name',)
  inlines = [MembershipInline]

# Custom admin class for Membership model
class MembershipAdmin(admin.ModelAdmin):
  list_display = ('user', 'club', 'is_manager')
  list_filter = ('is_manager',)
  search_fields = ('user__username', 'club__name')

# Custom admin class for Event model
class EventAdmin(admin.ModelAdmin):
  list_display = ('name', 'club', 'is_public')
  list_filter = ('is_public', 'club')
  search_fields = ('name', 'club__name')

# Custom admin class for EventParticipation model
class EventParticipationAdmin(admin.ModelAdmin):
  list_display = ('user', 'event')
  search_fields = ('user__username', 'event__name')

# Custom admin class for FinanceRecord model
class FinanceRecordAdmin(admin.ModelAdmin):
  list_display = ('club', 'amount', 'date', 'description')
  list_filter = ('club', 'date')
  search_fields = ('description',)

# Register models with their custom admin classes
admin.site.register(User, UserAdmin)
admin.site.register(Club, ClubAdmin)
admin.site.register(Membership, MembershipAdmin)
admin.site.register(Event, EventAdmin)
admin.site.register(EventParticipation, EventParticipationAdmin)
admin.site.register(FinanceRecord, FinanceRecordAdmin)