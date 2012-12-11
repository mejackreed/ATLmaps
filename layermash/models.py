from django.db import models
from owslib.wms import WebMapService
from django.dispatch import receiver
from django.db.models.signals import post_save

class wmsEndpoint(models.Model):
    name = models.CharField(max_length=50)
    url  = models.URLField(verbose_name="WMS base url")

    def __unicode__(self):
        return self.name

class Layer(models.Model):
    title           = models.CharField(max_length=25,blank=True)
    description     = models.CharField(max_length=300,default="Description of this map")
    wms_url         = models.ForeignKey(wmsEndpoint)
    wms_layer_name  = models.CharField(max_length=30)
    icon            = models.URLField(blank=True)
    bounds          = models.CharField(max_length=100, blank=True)

    def __unicode__(self):
        return self.title

    def save(self, force_insert=False, force_update=False):
        if not self.title:
            wms              = WebMapService(self.wms_url.url)
            layer            = wms[self.wms_layer_name]
            self.title       = layer.title
            if layer.abstract:
               self.description = layer.abstract
            else:
                self.description = ''
            try:
                self.icon        = layer.styles['raster']['legend']
            except KeyError:
                self.icon = ''
            self.bounds      = layer.boundingBox
        super(Layer, self).save(force_insert, force_update)

class Map(models.Model):
    title       = models.CharField(max_length=25)
    description = models.CharField(max_length=300,blank=True)
    center_lat  = models.DecimalField(max_digits=25, decimal_places=10,blank=True)
    center_lng  = models.DecimalField(max_digits=25, decimal_places=10, blank=True)
    layers      = models.ManyToManyField(Layer)

    def __unicode__(self):
        return self.title

#@receiver(post_save, sender=Layer)
def _get_wms_data(sender, instance=False, **kwargs ):
    layer= Layer.objects.get(pk=instance.id)
    wms = WebMapService(layer.wms_url.url)
    wms_layer  = wms[layer.wms_layer_name]
    layer.title = wms_layer.title
    layer.description = wms_layer.abstract
    layer.icon = wms_layer.styles['raster']['legend']
    layer.bounds = wms_layer.boundingBox
    layer.save()
