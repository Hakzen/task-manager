"""
Django Notes/Task Manager - URL Configuration

This module defines URL patterns for the task management system.
Each URL is mapped to its corresponding view function with proper
HTTP method requirements and naming conventions.

Author: Senior Full-Stack Developer
Created: 2026
"""

from django.urls import path
from . import views

# URL patterns for the notes_app
urlpatterns = [
    # Main page - list all tasks with search functionality
    path('', views.task_list, name='task_list'),
    
    # Add new task - handles form submission from main page
    path('add/', views.add_task, name='add_task'),
    
    # Edit task - displays edit form at /edit/<id>/
    path('edit/<int:id>/', views.edit_task, name='edit_task'),
    
    # Delete task - handles deletion at /delete/<id>/
    path('delete/<int:id>/', views.delete_task, name='delete_task'),
    
    # Toggle task completion - handles completion status toggle
    path('toggle/<int:id>/', views.toggle_task_completion, name='toggle_task_completion'),
]
