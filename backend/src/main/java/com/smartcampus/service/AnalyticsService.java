package com.smartcampus.service;

import com.smartcampus.dto.response.AdminAnalyticsResponse;
import com.smartcampus.dto.response.UserAnalyticsResponse;

public interface AnalyticsService {
  AdminAnalyticsResponse getAdminAnalytics(int days);
  UserAnalyticsResponse getUserAnalytics();
}

