package com.smartcampus.service.impl;

import com.smartcampus.dto.response.AdminAnalyticsResponse;
import com.smartcampus.dto.response.AdminAnalyticsResponse.CountByLabel;
import com.smartcampus.dto.response.AdminAnalyticsResponse.TrendData;
import com.smartcampus.service.AnalyticsService;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.LookupOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import com.smartcampus.dto.response.UserAnalyticsResponse;
import com.smartcampus.security.CurrentUser;
import com.smartcampus.entity.Booking;
import com.smartcampus.entity.Ticket;
import com.smartcampus.entity.Resource;
import com.smartcampus.entity.User;
import com.smartcampus.entity.Notification;
import org.bson.types.ObjectId;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final MongoTemplate mongoTemplate;

    @Override
    public AdminAnalyticsResponse getAdminAnalytics(int days) {
        // Basic counts
        long totalResources = mongoTemplate.count(new Query(), Resource.class);
        long pendingBookings = mongoTemplate.count(new Query(Criteria.where("status").is("PENDING")), Booking.class);
        long openTickets = mongoTemplate.count(new Query(Criteria.where("status").is("OPEN")), Ticket.class);
        long activeUsers = mongoTemplate.count(new Query(), User.class);

        // Booking counts by status
        var bookingAgg = Aggregation.newAggregation(
                Aggregation.group("status").count().as("count"),
                Aggregation.project("count").and("_id").as("label"));
        List<CountByLabel> bookings = mongoTemplate.aggregate(bookingAgg, Booking.class, CountByLabel.class)
                .getMappedResults();

        // Ticket counts by status
        var ticketAgg = Aggregation.newAggregation(
                Aggregation.group("status").count().as("count"),
                Aggregation.project("count").and("_id").as("label"));
        List<CountByLabel> tickets = mongoTemplate.aggregate(ticketAgg, Ticket.class, CountByLabel.class)
                .getMappedResults();

        // Top booked resources (APPROVED bookings)
        var topAgg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("status").is("APPROVED")),
                Aggregation.group("resource").count().as("count"),
                Aggregation.sort(org.springframework.data.domain.Sort.Direction.DESC, "count"),
                Aggregation.limit(5),
                LookupOperation.newLookup().from("resources").localField("_id").foreignField("_id")
                        .as("res"),
                Aggregation.unwind("res"),
                Aggregation.project("count").and("res.name").as("label"));
        List<CountByLabel> top = mongoTemplate.aggregate(topAgg, Booking.class, CountByLabel.class).getMappedResults();

        // Calculate trends for requested range
        List<TrendData> trends = calculateTrends(days);

        // Resource distribution by type
        var resAgg = Aggregation.newAggregation(
                Aggregation.group("type").count().as("count"),
                Aggregation.project("count").and("_id").as("label"));
        List<CountByLabel> distribution = mongoTemplate.aggregate(resAgg, Resource.class, CountByLabel.class)
                .getMappedResults();

        return new AdminAnalyticsResponse(
                totalResources,
                pendingBookings,
                openTickets,
                activeUsers,
                bookings,
                tickets,
                top,
                trends,
                distribution);
    }

    private List<TrendData> calculateTrends(int days) {
        Map<LocalDate, TrendDataBuilder> trendMap = new TreeMap<>();
        LocalDate today = LocalDate.now();

        // Initialize range days
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            trendMap.put(date, new TrendDataBuilder(date));
        }

        // Aggregate Bookings by day
        fetchTrendCounts(Booking.class, trendMap, true, days);
        // Aggregate Tickets by day
        fetchTrendCounts(Ticket.class, trendMap, false, days);

        return trendMap.values().stream()
                .map(TrendDataBuilder::build)
                .toList();
    }

    private void fetchTrendCounts(Class<?> entityClass, Map<LocalDate, TrendDataBuilder> trendMap, boolean isBooking, int days) {
        var agg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("createdAt").gte(Instant.now().minus(java.time.Duration.ofDays(days)))),
                Aggregation.project()
                        .andExpression("dateToString('%Y-%m-%d', createdAt)").as("date"),
                Aggregation.group("date").count().as("count"),
                Aggregation.project("count").and("_id").as("label"));

        List<CountByLabel> results = mongoTemplate.aggregate(agg, entityClass, CountByLabel.class).getMappedResults();

        for (CountByLabel res : results) {
            try {
                LocalDate date = LocalDate.parse(res.label());
                if (trendMap.containsKey(date)) {
                    if (isBooking) trendMap.get(date).bookings = res.count();
                    else trendMap.get(date).tickets = res.count();
                }
            } catch (Exception ignored) {}
        }
    }

    private static class TrendDataBuilder {
        private final LocalDate date;
        long bookings = 0;
        long tickets = 0;

        TrendDataBuilder(LocalDate date) { this.date = date; }

        TrendData build() {
            String dayName = date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            return new TrendData(dayName, bookings, tickets);
        }
    }

    @Override
    public UserAnalyticsResponse getUserAnalytics() {
        String userId = CurrentUser.id();

        long activeBookings = mongoTemplate.count(
                new Query(Criteria.where("user").is(new ObjectId(userId)).and("status").in("PENDING", "APPROVED")),
                Booking.class);

        long openTickets = mongoTemplate.count(
                new Query(Criteria.where("createdBy").is(new ObjectId(userId)).and("status").is("OPEN")),
                Ticket.class);

        long unreadNotifications = mongoTemplate.count(
                new Query(Criteria.where("user").is(new ObjectId(userId)).and("read").is(false)),
                Notification.class);

        // Personal Booking splits
        var bookingAgg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("user").is(new ObjectId(userId))),
                Aggregation.group("status").count().as("count"),
                Aggregation.project("count").and("_id").as("label"));
        List<UserAnalyticsResponse.CountByLabel> bookings = mongoTemplate
                .aggregate(bookingAgg, Booking.class, UserAnalyticsResponse.CountByLabel.class).getMappedResults();

        // Personal Ticket splits
        var ticketAgg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("createdBy").is(new ObjectId(userId))),
                Aggregation.group("status").count().as("count"),
                Aggregation.project("count").and("_id").as("label"));
        List<UserAnalyticsResponse.CountByLabel> tickets = mongoTemplate
                .aggregate(ticketAgg, Ticket.class, UserAnalyticsResponse.CountByLabel.class).getMappedResults();

        return new UserAnalyticsResponse(
                activeBookings,
                openTickets,
                unreadNotifications,
                bookings,
                tickets);
    }
}
