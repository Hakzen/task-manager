"""
Django Notes/Task Manager - Models Module

This module defines the Task model for the task management system.
The Task model represents a single task/note that users can create,
read, update, and delete through the web interface.

Author: Senior Full-Stack Developer
Created: 2026
"""

from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.utils import timezone


class Task(models.Model):
    """
    Task model representing a user task or note.
    
    This model stores task information including title, description,
    creation timestamp, and other metadata. All tasks are persisted
    in the SQLite database using Django ORM.
    
    Attributes:
        title (CharField): The task title (required, max 200 characters)
        description (TextField): Optional task description
        created_at (DateTimeField): Auto-generated timestamp when task is created
        updated_at (DateTimeField): Auto-updated timestamp when task is modified
        is_completed (BooleanField): Task completion status
    """
    
    # Task title with validation
    title = models.CharField(
        max_length=200,
        validators=[
            MinLengthValidator(1, message="Task title cannot be empty"),
            MaxLengthValidator(200, message="Task title cannot exceed 200 characters")
        ],
        help_text="Enter a descriptive title for your task",
        error_messages={
            'required': 'Task title is required. Please enter a title.',
            'blank': 'Task title cannot be blank. Please enter a title.'
        }
    )
    
    # Optional task description
    description = models.TextField(
        blank=True,
        help_text="Add additional details about your task (optional)",
        max_length=2000
    )
    
    # Auto-generated creation timestamp
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the task was created"
    )
    
    # Auto-updated modification timestamp
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when the task was last updated"
    )
    
    # Task completion status
    is_completed = models.BooleanField(
        default=False,
        help_text="Mark whether the task has been completed"
    )
    
    class Meta:
        """
        Meta configuration for the Task model.
        """
        # Order tasks by creation date (newest first)
        ordering = ['-created_at']
        
        # Database table name
        db_table = 'tasks'
        
        # Verbose names for Django admin
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'
        
        # Add database indexes for better performance
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['is_completed']),
            models.Index(fields=['title']),
        ]
    
    def __str__(self):
        """
        String representation of the Task model.
        
        Returns:
            str: The task title, truncated if too long
        """
        # Return title, truncated if longer than 50 characters
        if len(self.title) > 50:
            return f"{self.title[:47]}..."
        return self.title
    
    def get_absolute_url(self):
        """
        Get the absolute URL for this task.
        
        Returns:
            str: URL to edit this task
        """
        from django.urls import reverse
        return reverse('edit_task', kwargs={'id': self.id})
    
    @property
    def description_preview(self):
        """
        Get a short preview of the task description.
        
        Returns:
            str: First 100 characters of description, with ellipsis if truncated
        """
        if not self.description:
            return ""
        if len(self.description) <= 100:
            return self.description
        return f"{self.description[:97]}..."
    
    @property
    def created_date_formatted(self):
        """
        Get formatted creation date for display.
        
        Returns:
            str: Formatted date string (e.g., "Jan 15, 2026")
        """
        return self.created_at.strftime("%b %d, %Y")
    
    @property
    def created_time_formatted(self):
        """
        Get formatted creation time for display.
        
        Returns:
            str: Formatted time string (e.g., "3:30 PM")
        """
        return self.created_at.strftime("%I:%M %p")
    
    def mark_completed(self):
        """
        Mark the task as completed.
        
        This method updates the is_completed status and saves the task.
        """
        self.is_completed = True
        self.save()
    
    def mark_incomplete(self):
        """
        Mark the task as incomplete.
        
        This method updates the is_completed status and saves the task.
        """
        self.is_completed = False
        self.save()
    
    def toggle_completion(self):
        """
        Toggle the completion status of the task.
        
        Returns:
            bool: New completion status after toggle
        """
        self.is_completed = not self.is_completed
        self.save()
        return self.is_completed
