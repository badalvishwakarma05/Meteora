from django.db import models
from django.utils import timezone

class CyclonePredictionRecord(models.Model):
    """
    Persists live multi-modal CNN-LSTM cyclone intensification predictions
    and real-time meteorological precursor telemetry in SQLite / PostgreSQL.
    """
    cyclone_name = models.CharField(max_length=120, default='CYCLONE DANA (BOB-02)')
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    latitude = models.FloatField(default=15.4)
    longitude = models.FloatField(default=87.2)
    
    # Core Model Output
    probability_score = models.FloatField(help_text="Intensification Probability (0.0% to 100.0%)")
    risk_level = models.CharField(max_length=80, default='CRITICAL INTENSIFICATION')
    risk_badge = models.CharField(max_length=40, default='CRITICAL')
    geographic_alert = models.TextField(default='Immediate evacuation dispatch advised for coastal sectors.')
    
    # Input Data Telemetry
    satellite_file = models.CharField(max_length=255, default='3RIMG_01JAN2024_2315_L1B_STD_V01R00.h5')
    central_pressure_hpa = models.FloatField(default=962.0)
    max_wind_speed_kmh = models.FloatField(default=175.0)
    temperature_celsius = models.FloatField(default=28.6)
    relative_humidity = models.FloatField(default=94.0)
    
    # Metadata
    model_version = models.CharField(max_length=100, default='MultiModal-CNN-LSTM-v1.0 (Spatial CNN + Temporal LSTM)')
    raw_payload_json = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Cyclone Prediction Record'
        verbose_name_plural = 'Cyclone Prediction Records'

    def __str__(self):
        return f"[{self.created_at.strftime('%Y-%m-%d %H:%M')}] {self.cyclone_name} - {self.probability_score:.1f}% ({self.risk_level})"

    def to_dict(self):
        return {
            'id': self.id,
            'cyclone_name': self.cyclone_name,
            'timestamp': self.created_at.strftime('%Y-%m-%d %H:%M:%S UTC'),
            'coordinates': {'lat': self.latitude, 'lon': self.longitude},
            'intensification_probability': self.probability_score,
            'risk_level': self.risk_level,
            'risk_badge': self.risk_badge,
            'geographic_alert': self.geographic_alert,
            'satellite_file': self.satellite_file,
            'central_pressure_hpa': self.central_pressure_hpa,
            'max_wind_speed_kmh': self.max_wind_speed_kmh,
            'temperature_celsius': self.temperature_celsius,
            'relative_humidity': self.relative_humidity,
            'model_version': self.model_version
        }
