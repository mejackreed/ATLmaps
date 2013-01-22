__author__ = 'cbn'

from django.contrib import admin
from layermash.models import *

class LayerAdmin(admin.ModelAdmin):
    fieldsets = [ (None,{'fields': ['wms_url', 'wms_layer_name']}),]


admin.site.register(WMSLayer)
admin.site.register(DataLayer)
admin.site.register(Map)
admin.site.register(wmsEndpoint)






