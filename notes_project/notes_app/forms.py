"""
Django Notes/Task Manager - Forms Module

This module defines Django forms for the task management system.
Forms provide validation, cleaning, and proper rendering of user input.

Author: Senior Full-Stack Developer
Created: 2026
"""

from django import forms
from django.core.validators import MinLengthValidator, MaxLengthValidator
from .models import Task


class TaskForm(forms.ModelForm):
    """
    Django form for creating and editing Task instances.
    
    This form provides validation and proper widget configuration
    for the Task model fields. It includes custom validation
    logic and user-friendly error messages.
    """
    
    class Meta:
        """
        Meta configuration for the TaskForm.
        """
        model = Task
        fields = ['title', 'description']
        
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter task title...',
                'required': True,
                'autofocus': True,
                'maxlength': 200,
                'aria-label': 'Task title'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Enter task description (optional)...',
                'rows': 3,
                'maxlength': 2000,
                'aria-label': 'Task description'
            })
        }
        
        error_messages = {
            'title': {
                'required': 'Please enter a task title.',
                'max_length': 'Task title cannot exceed 200 characters.',
            }
        }
    
    def __init__(self, *args, **kwargs):
        """
        Initialize the form with custom attributes and validation.
        """
        super().__init__(*args, **kwargs)
        
        # Add help text and custom attributes
        self.fields['title'].help_text = "Required: Enter a descriptive title for your task"
        self.fields['description'].help_text = "Optional: Add additional details about your task"
        
        # Add CSS classes for validation states
        for field_name, field in self.fields.items():
            field.widget.attrs.update({
                'class': field.widget.attrs.get('class', '') + ' form-control'
            })
    
    def clean_title(self):
        """
        Custom validation for the title field.
        
        Returns:
            str: Cleaned title data
            
        Raises:
            forms.ValidationError: If title validation fails
        """
        title = self.cleaned_data.get('title')
        
        if title:
            # Strip whitespace
            title = title.strip()
            
            # Check if title is empty after stripping
            if not title:
                raise forms.ValidationError("Task title cannot be empty or just whitespace.")
            
            # Check for minimum length
            if len(title) < 1:
                raise forms.ValidationError("Task title must be at least 1 character long.")
            
            # Check for maximum length
            if len(title) > 200:
                raise forms.ValidationError("Task title cannot exceed 200 characters.")
        
        return title
    
    def clean_description(self):
        """
        Custom validation for the description field.
        
        Returns:
            str: Cleaned description data
            
        Raises:
            forms.ValidationError: If description validation fails
        """
        description = self.cleaned_data.get('description')
        
        if description:
            # Strip whitespace
            description = description.strip()
            
            # Check for maximum length
            if len(description) > 2000:
                raise forms.ValidationError("Task description cannot exceed 2000 characters.")
        
        return description
    
    def clean(self):
        """
        Custom form-level validation.
        
        Returns:
            dict: Cleaned form data
            
        Raises:
            forms.ValidationError: If form-level validation fails
        """
        cleaned_data = super().clean()
        
        # Get cleaned data
        title = cleaned_data.get('title')
        description = cleaned_data.get('description')
        
        # Add any cross-field validation here if needed
        # For example: check if title and description are the same
        if title and description and title.strip() == description.strip():
            raise forms.ValidationError(
                "Task title and description should not be identical."
            )
        
        return cleaned_data


class TaskSearchForm(forms.Form):
    """
    Form for searching tasks by title.
    
    This form provides a simple search interface with validation
    for the search query.
    """
    
    search_query = forms.CharField(
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control search-input',
            'placeholder': 'Search tasks by title...',
            'aria-label': 'Search tasks'
        }),
        help_text="Enter keywords to search in task titles"
    )
    
    def clean_search_query(self):
        """
        Custom validation for the search query field.
        
        Returns:
            str: Cleaned search query
            
        Raises:
            forms.ValidationError: If search query validation fails
        """
        query = self.cleaned_data.get('search_query')
        
        if query:
            # Strip whitespace
            query = query.strip()
            
            # Check for minimum length (optional - can be removed)
            if len(query) < 1:
                raise forms.ValidationError("Search query must contain at least 1 character.")
            
            # Check for maximum length
            if len(query) > 100:
                raise forms.ValidationError("Search query cannot exceed 100 characters.")
        
        return query
