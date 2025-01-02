# AutoMerge Client

### Message format
```
{
  "calendar" : [
    {
        "id":"aeb75602-69f0-43b3-b1d7-ef55e22d3ac1",
        "date": "2025-01-10",
        "startDate": null,
        "endDate": null,
        "title": "ДР Шая",
        "description": "Description 1",
        "position": 0,
        "tags": ["birthday", "important"]
    },
    {
        "id":"aeb75602-69f0-43b3-b1d7-ef55e22d3ac1",
        "date": null,
        "startDate": "2025-01-11",
        "endDate": "2025-01-12",
        "title": "Кирилл в отпуске",
        "description": "Description 1",
        "position": 1000,
        "tags": ["work", "cot_private"]
    }
  ],
  "tasks": [
    {
        "id":"aeb75602-69f0-43b3-b1d7-ef55e22d3ac2",
        "startDate": "2025-01-10",
        "dueDate": "2025-01-10",
        "title": "Далекий таск startDate and dueDate",
        "description": "Description 1",
        "position": 0,
        "tags": []
    },
    {
        "id":"aeb75602-69f0-43b3-b1d7-ef55e22d3ac2",
        "startDate": "2025-01-10",
        "dueDate": null,
        "title": "Далекий таск dueDate",
        "description": "Description 1",
        "position": 0,
        "tags": []
    },
    {
        "id":"aeb75602-69f0-43b3-b1d7-ef55e22d3ac2",
        "startDate": "2025-01-10",
        "dueDate": null,
        "title": "Далекий таск startDate",
        "description": "Description 1",
        "position": 0,
        "tags": ["important"]
    },
    {
        "id":"aeb75602-69f0-43b3-b1d7-ef55e22d3ac2",
        "startDate": null,
        "dueDate": null,
        "title": "Далекий таск просто",
        "description": "Description 1",
        "position": 0,
        "tags": []
    }
  ],
  "toBuy": [
    {
        "id":"aeb75602-69f0-43b3-b1d7-ef55e22d3ac3",
        "startDate": "2025-01-10",
        "dueDate": "2025-01-10",
        "title": "Task 1",
        "description": "Description 1",
        "position": 0,
        "tags": []
    }
  ]
}
```
