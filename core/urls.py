"""
URL configuration for core project with i18n language switching endpoints.

Terminal Commands Reference for i18n:
  - Generate messages: django-admin makemessages -l hi -l bn -l or
  - Compile messages:  django-admin compilemessages
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('i18n/', include('django.conf.urls.i18n')),  # Built-in Django language switcher endpoint (/i18n/setlang/)
    path('', include('viewer.urls')),
]
