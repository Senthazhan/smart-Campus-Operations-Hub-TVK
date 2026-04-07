package com.smartcampus.dto.response;

import java.util.List;

public record AdminAnalyticsResponse(
    long totalResources,
    long pendingBookings,
    long openTickets,
    long activeUsers,
    List<CountByLabel> bookingsByStatus,
    List<CountByLabel> ticketsByStatus,
    List<CountByLabel> topBookedResources,
    List<TrendData> trends,
    List<CountByLabel> resourceDistribution
) {
  public record CountByLabel(String label, long count) {}
  public record TrendData(String name, long bookings, long tickets) {}
}

