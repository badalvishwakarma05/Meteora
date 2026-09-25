from django.urls import path
from .views import (
    patch_viewer_view,
    api_files_view,
    api_extract_patch_view,
    api_ml_detect_view,
    api_ml_classify_view,
    api_ml_predict_impact_view,
    api_spatial_risk_view,
    api_multimodal_status_view,
    api_live_intensification_view,
    api_historical_tracks_view,
    api_historical_cyclones_view,
    api_predict_trajectory_view
)

urlpatterns = [
    path('', patch_viewer_view, name='patch_viewer'),
    path('api/files/', api_files_view, name='api_files'),
    path('api/extract-patch/', api_extract_patch_view, name='api_extract_patch'),
    path('api/ml/detect/', api_ml_detect_view, name='api_ml_detect'),
    path('api/ml/classify/', api_ml_classify_view, name='api_ml_classify'),
    path('api/ml/predict-impact/', api_ml_predict_impact_view, name='api_ml_predict_impact'),
    path('api/spatial-risk/', api_spatial_risk_view, name='api_spatial_risk'),
    path('api/multimodal-status/', api_multimodal_status_view, name='api_multimodal_status'),
    path('api/ml/intensification/', api_live_intensification_view, name='api_live_intensification'),
    path('api/live-prediction/', api_live_intensification_view, name='api_live_prediction_alias'),
    path('api/historical-tracks/', api_historical_tracks_view, name='api_historical_tracks'),
    path('api/historical-cyclones/', api_historical_cyclones_view, name='api_historical_cyclones'),
    path('api/predict-trajectory/', api_predict_trajectory_view, name='api_predict_trajectory'),
]



