from layermash.models import *
from django.shortcuts import render_to_response
from django.template import RequestContext

def layer(request, layer_id):
  if request.method == 'GET':
    layer = Layer.objects.get(pk=layer_id)
    return render_to_response('layer.html',{'layer': layer}, context_instance=RequestContext(request))




def map(request, map_id):
    if request.method == 'GET':
        map = Map.objects.get(pk=map_id)
        return render_to_response('map.html',{'map': map}, context_instance=RequestContext(request))



