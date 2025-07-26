from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    # list_display defines the fields to be displayed in the list view of the admin interface.
    # 'reason' has been renamed to 'type' in the Payment model.
    list_display = ('student', 'type', 'amount', 'due_date', 'status', 'created_at')
    # list_filter provides filters in the sidebar of the admin list view.
    list_filter = ('status', 'type', 'due_date')
    # search_fields enables a search bar for the specified fields.
    search_fields = ('student__username', 'type') # Allow searching by student username and payment type
    # readonly_fields makes certain fields read-only in the admin detail view.
    readonly_fields = ('created_at',) # created_at is auto_now_add

    # Raw ID fields can improve performance for foreign key lookups in the admin
    raw_id_fields = ('student',)
