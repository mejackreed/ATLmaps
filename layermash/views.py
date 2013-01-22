from layermash.models import *
from django.shortcuts import render, render_to_response, HttpResponseRedirect
from django.template import RequestContext

def home(request):
    return render_to_response('home.html', {}, context_instance=RequestContext(request))

def layer(request, layer_id):
  if request.method == 'GET':
    layer = Layer.objects.get(pk=layer_id)
    return render_to_response('layer.html',{'layer': layer}, context_instance=RequestContext(request))

def wmslayer(request, layer_id):
  if request.method == 'GET':
    layer = WMSLayer.objects.get(pk=layer_id)
    return render_to_response('layer.html',{'layer': layer}, context_instance=RequestContext(request))

def jsonlayer(request, layer_id):
  if request.method == 'GET':
    layer = JSONLayer.objects.get(pk=layer_id)
    return render_to_response('layer.html',{'layer': layer}, context_instance=RequestContext(request))

def map(request, map_id):
    if request.method == 'GET':
        map = Map.objects.get(pk=map_id)
        return render_to_response('map.html',{'map': map}, context_instance=RequestContext(request))

def add_map(request):
    if request.method == 'GET':
        wmslayers = WMSLayer.objects.all()
        jsonlayers = JSONLayer.objects.all()
        form = MapForm(initial={})
        return render_to_response('add_map.html',{'wmslayers' : wmslayers, 'jsonlayers' : jsonlayers, 'form': form}, context_instance = RequestContext(request))

    if request.method == "POST":
        form = MapForm(request.POST)
        if form.is_valid():
            title       = form.cleaned_data['title']
            description = form.cleaned_data['description']
            center_lat  = form.cleaned_data['center_lat']
            center_lng  = form.cleaned_data['center_lng']
            layers      = form.cleaned_data['layers']
        else:
            layers = WMSLayer.objects.all()
            return render_to_response('add_map.html',{'layers' : layers, 'form': form}, context_instance = RequestContext(request))
        
        map = Map(title=title, description=description, center_lat=center_lat, center_lng=center_lng)
        map.save()

        for wmslayer in wmslayers:
            map.wmslayers.add(wmslayer)
        
        map.save()

        return HttpResponseRedirect('/map/' + str(map.id))