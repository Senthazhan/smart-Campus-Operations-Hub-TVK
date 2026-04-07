package com.smartcampus.dto.response;

import java.util.List;

public record UserAnalyticsResponse(
    long activeBookings,
    long openTickets,
    long unreadNotifications,
    List<CountByLabel> bookingsByStatus,
    List<CountByLabel> ticketsByStatus
) {
  public record CountByLabel(String label, long count) {}
}
