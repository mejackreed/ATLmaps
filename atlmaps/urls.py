from django.conf.urls import patterns, include, url
from django.views.generic import ListView
from layermash.models import *

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('layermash.views',

    url(r'^layer/(?P<layer_id>\d+)/$', 'layer'),
    url(r'^maps/(?P<map_id>\d+)/','map'),
    url(r'^layers/$', ListView.as_view(
        model=Layer, template_name='layers.html'
    )),

    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
