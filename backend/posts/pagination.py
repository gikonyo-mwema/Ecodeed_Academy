"""
Custom pagination classes for the posts API.

Provides backward-compatible pagination that matches the response shape
the frontend already expects, while using proper DRF pagination internals.

Industry standard: DRF PageNumberPagination with custom response envelope.

Response shapes supported:
  - Legacy (list endpoint): { posts: [...], totalPosts: N, lastMonthPosts: N, pagination: {...} }
  - Standard DRF: { count, next, previous, results }
"""

import math

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class PostPageNumberPagination(PageNumberPagination):
    """
    Page-number based pagination that returns the response envelope
    the frontend expects.

    Query params:
      - page  (1-based, default 1)
      - limit (alias for page_size, default 9)
      - startIndex  (legacy — converted to page internally)

    Response:
      {
        "posts": [...],
        "totalPosts": 42,
        "pagination": {
          "totalPosts": 42,
          "totalPages": 5,
          "currentPage": 1,
          "postsPerPage": 9,
          "hasNextPage": true,
          "hasPreviousPage": false,
          "next": "http://...?page=2",
          "previous": null
        }
      }
    """

    page_size = 9
    page_size_query_param = "limit"
    max_page_size = 100
    page_query_param = "page"

    # ------------------------------------------------------------------
    # Override get_page_number to support legacy startIndex param
    # ------------------------------------------------------------------
    def get_page_number(self, request, paginator):
        """
        Support both ?page=N and legacy ?startIndex=N&limit=M.
        If startIndex is present (and page is not), convert it.
        """
        page_number = request.query_params.get(self.page_query_param)
        start_index = request.query_params.get("startIndex")

        if page_number:
            return page_number

        if start_index is not None:
            try:
                idx = int(start_index)
                size = self.get_page_size(request) or self.page_size
                return max(1, (idx // size) + 1)
            except (ValueError, TypeError):
                pass

        return 1

    def get_paginated_response(self, data, **extra):
        """
        Return the custom envelope.  Accepts **extra so the view can
        inject lastMonthPosts or other stats without a second query.
        """
        total = self.page.paginator.count
        page_size = self.get_page_size(self.request) or self.page_size
        total_pages = math.ceil(total / page_size) if page_size else 1
        current_page = self.page.number

        response_data = {
            "posts": data,
            "totalPosts": total,
            "pagination": {
                "totalPosts": total,
                "totalPages": total_pages,
                "currentPage": current_page,
                "postsPerPage": page_size,
                "hasNextPage": self.page.has_next(),
                "hasPreviousPage": self.page.has_previous(),
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
            },
        }
        response_data.update(extra)
        return Response(response_data)


class SmallResultsPagination(PageNumberPagination):
    """Lightweight pagination for categories / tags (small tables)."""

    page_size = 50
    page_size_query_param = "limit"
    max_page_size = 200
