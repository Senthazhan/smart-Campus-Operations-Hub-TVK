package com.smartcampus.repository;

import com.smartcampus.entity.Booking;
import com.smartcampus.enums.BookingStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface BookingRepository extends MongoRepository<Booking, String> {

  @Query(value = "{ 'resource': ?0, 'bookingDate': ?1, 'status': { $in: ?4 }, 'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 } }", count = true)
  long countConflicts(
      String resourceId,
      LocalDate bookingDate,
      LocalTime startTime,
      LocalTime endTime,
      Collection<BookingStatus> statuses
  );

  @Query(value = "{ '_id': { $ne: ?0 }, 'resource': ?1, 'bookingDate': ?2, 'status': { $in: ?5 }, 'startTime': { $lt: ?4 }, 'endTime': { $gt: ?3 } }", count = true)
  long countConflictsExcludingBooking(
      String bookingId,
      String resourceId,
      LocalDate bookingDate,
      LocalTime startTime,
      LocalTime endTime,
      Collection<BookingStatus> statuses
  );

  List<Booking> findAllByBookingDateAndStatusIn(LocalDate bookingDate, Collection<BookingStatus> statuses);

  List<Booking> findAllByStatus(BookingStatus status);

  Page<Booking> findAllByUserId(String userId, Pageable pageable);
}

