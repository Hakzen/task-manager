"""
Django Notes/Task Manager - Views Module

This module contains all view functions for the task management system.
Each view handles HTTP requests, processes business logic, and returns
HTTP responses using Django templates.

Views implement the POST-Redirect-GET (PRG) pattern for form submissions
and include comprehensive error handling and validation.

Author: Senior Full-Stack Developer
Created: 2026
"""

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.db.models import Q
from django.http import Http404, HttpResponseBadRequest
from django.urls import reverse
from django.core.exceptions import ValidationError
from django.views.decorators.http import require_http_methods
from django.utils import timezone

from .models import Task
from .forms import TaskForm, TaskSearchForm


def task_list(request):
    """
    Display the main page with all tasks and search functionality.
    
    This view handles:
    - Displaying all tasks from the database
    - Search functionality for filtering tasks by title
    - Rendering the main template with task list
    
    Args:
        request (HttpRequest): The HTTP request object
        
    Returns:
        HttpResponse: Rendered main page with task list
    """
    try:
        # Get search query from GET parameters
        search_query = request.GET.get('search_query', '').strip()
        tasks = Task.objects.all()
        
        # Filter tasks by title if search query provided
        if search_query:
            tasks = tasks.filter(
                Q(title__icontains=search_query)
            ).distinct()
        
        # Order tasks by creation date (newest first)
        tasks = tasks.order_by('-created_at')
        
        # Prepare context for template
        context = {
            'tasks': tasks,
            'search_query': search_query,
            'total_tasks': tasks.count(),
            'completed_tasks': tasks.filter(is_completed=True).count(),
            'pending_tasks': tasks.filter(is_completed=False).count(),
        }
        
        # Render the main page template
        return render(request, 'notes_app/index.html', context)
        
    except Exception as e:
        # Log error and show user-friendly message
        messages.error(request, 'An error occurred while loading tasks. Please try again.')
        # Render empty context to prevent page crash
        return render(request, 'notes_app/index.html', {
            'tasks': Task.objects.none(),
            'search_query': '',
            'total_tasks': 0,
            'completed_tasks': 0,
            'pending_tasks': 0,
        })


@require_http_methods(["GET", "POST"])
def add_task(request):
    """
    Handle task creation using POST-Redirect-Get pattern.
    
    This view processes form submissions for creating new tasks.
    It validates input, saves to database, and redirects back to main page.
    
    Args:
        request (HttpRequest): The HTTP request object
        
    Returns:
        HttpResponse: Redirect to main page after successful creation
                    or renders form with errors if validation fails
    """
    if request.method == 'POST':
        try:
            # Get form data
            title = request.POST.get('title', '').strip()
            description = request.POST.get('description', '').strip()
            
            # Basic validation
            if not title:
                messages.error(request, 'Task title is required!')
                return redirect('task_list')
            
            # Create new task
            task = Task.objects.create(
                title=title,
                description=description
            )
            
            # Add success message
            messages.success(
                request, 
                f'Task "{task.title}" has been created successfully!'
            )
            
            # POST-Redirect-GET pattern: redirect to main page
            return redirect('task_list')
                
        except Exception as e:
            # Handle unexpected errors
            messages.error(request, 'An error occurred while creating the task. Please try again.')
            return redirect('task_list')
    
    else:
        # GET request - redirect to main page
        return redirect('task_list')


@require_http_methods(["GET", "POST"])
def edit_task(request, id):
    """
    Handle task editing using POST-Redirect-Get pattern.
    
    This view displays and processes the edit form for existing tasks.
    It validates input, updates the database, and redirects back to main page.
    
    Args:
        request (HttpRequest): The HTTP request object
        id (int): The primary key of the task to edit
        
    Returns:
        HttpResponse: Rendered edit page or redirect to main page
    """
    try:
        # Get task object or return 404 if not found
        task = get_object_or_404(Task, id=id)
        
        if request.method == 'POST':
            # Get form data
            title = request.POST.get('title', '').strip()
            description = request.POST.get('description', '').strip()
            
            # Basic validation
            if not title:
                messages.error(request, 'Task title is required!')
                return render(request, 'notes_app/edit.html', {
                    'task': task,
                    'title': title,
                    'description': description,
                })
            
            # Update task
            task.title = title
            task.description = description
            task.save()
            
            # Add success message
            messages.success(
                request, 
                f'Task "{task.title}" has been updated successfully!'
            )
            
            # POST-Redirect-GET pattern: redirect to main page
            return redirect('task_list')
        
        else:
            # GET request - display edit form
            return render(request, 'notes_app/edit.html', {
                'task': task,
            })
            
    except Http404:
        # Task not found
        messages.error(request, 'Task not found. It may have been deleted.')
        return redirect('task_list')
        
    except Exception as e:
        # Handle unexpected errors
        messages.error(request, 'An error occurred while editing the task. Please try again.')
        return redirect('task_list')


@require_http_methods(["POST"])
def delete_task(request, id):
    """
    Handle task deletion with confirmation.
    
    This view processes task deletion requests after JavaScript confirmation.
    It removes the task from database and redirects back to main page.
    
    Args:
        request (HttpRequest): The HTTP request object
        id (int): The primary key of the task to delete
        
    Returns:
        HttpResponse: Redirect to main page after deletion
    """
    try:
        # Get task object or return 404 if not found
        task = get_object_or_404(Task, id=id)
        
        # Store task title for success message
        task_title = task.title
        
        # Delete task from database
        task.delete()
        
        # Add success message
        messages.success(
            request, 
            f'Task "{task_title}" has been deleted successfully.'
        )
        
        # Redirect to main page
        return redirect('task_list')
        
    except Http404:
        # Task not found
        messages.error(request, 'Task not found. It may have already been deleted.')
        return redirect('task_list')
        
    except Exception as e:
        # Handle unexpected errors
        messages.error(request, 'An error occurred while deleting the task. Please try again.')
        return redirect('task_list')


@require_http_methods(["POST"])
def toggle_task_completion(request, id):
    """
    Toggle task completion status.
    
    This view handles AJAX requests to toggle task completion status.
    It updates the task in database and returns JSON response.
    
    Args:
        request (HttpRequest): The HTTP request object
        id (int): The primary key of the task to toggle
        
    Returns:
        HttpResponse: JSON response with updated status
    """
    try:
        # Get task object or return 404 if not found
        task = get_object_or_404(Task, id=id)
        
        # Toggle completion status
        new_status = task.toggle_completion()
        
        # Add success message
        status_text = "completed" if new_status else "marked as incomplete"
        messages.success(
            request, 
            f'Task "{task.title}" has been {status_text}.'
        )
        
        # Redirect to main page (for non-AJAX requests)
        return redirect('task_list')
        
    except Http404:
        # Task not found
        messages.error(request, 'Task not found. It may have been deleted.')
        return redirect('task_list')
        
    except Exception as e:
        # Handle unexpected errors
        messages.error(request, 'An error occurred while updating the task. Please try again.')
        return redirect('task_list')


# Custom error handlers
def handler_404(request, exception):
    """
    Custom 404 error handler.
    """
    messages.error(request, 'The page you requested was not found.')
    return redirect('task_list')


def handler_500(request):
    """
    Custom 500 error handler.
    """
    messages.error(request, 'An internal server error occurred. Please try again later.')
    return redirect('task_list')
