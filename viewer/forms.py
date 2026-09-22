from django import forms
from .utils import get_available_h5_files

COLORMAP_CHOICES = [
    ('inferno', 'Inferno (Thermal Dark/Orange)'),
    ('magma', 'Magma (High Contrast Thermal)'),
    ('plasma', 'Plasma (Vivid Thermal)'),
    ('jet', 'Jet (Classic Rainbow Satellite)'),
    ('turbo', 'Turbo (Modern Rainbow)'),
    ('viridis', 'Viridis (Perceptually Uniform)'),
    ('gray_r', 'Inverted Grayscale (IR Radiance)'),
]

PATCH_SIZE_CHOICES = [
    (64, '64 x 64 pixels'),
    (128, '128 x 128 pixels (Standard Cyclone Patch)'),
    (256, '256 x 256 pixels (Wide View)'),
]

class CyclonePatchForm(forms.Form):
    file_name = forms.ChoiceField(
        label="Select HDF5 (.h5) Satellite File",
        choices=[],
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    target_lat = forms.FloatField(
        label="Target Latitude (°N)",
        initial=15.0,
        min_value=-90.0,
        max_value=90.0,
        widget=forms.NumberInput(attrs={'class': 'form-input', 'step': '0.01', 'placeholder': 'e.g. 15.0'})
    )
    target_lon = forms.FloatField(
        label="Target Longitude (°E)",
        initial=72.0,
        min_value=-180.0,
        max_value=180.0,
        widget=forms.NumberInput(attrs={'class': 'form-input', 'step': '0.01', 'placeholder': 'e.g. 72.0'})
    )
    patch_size = forms.TypedChoiceField(
        label="Patch Size",
        choices=PATCH_SIZE_CHOICES,
        coerce=int,
        initial=128,
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    colormap = forms.ChoiceField(
        label="Thermal Palette / Colormap",
        choices=COLORMAP_CHOICES,
        initial='inferno',
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    def __init__(self, *args, **kwargs):
        data_dir = kwargs.pop('data_dir', './data')
        super().__init__(*args, **kwargs)
        available_files = get_available_h5_files(data_dir)
        if available_files:
            file_choices = [(f, f) for f in available_files]
        else:
            file_choices = [('', 'No .h5 files found in ./data/ folder')]
        self.fields['file_name'].choices = file_choices
