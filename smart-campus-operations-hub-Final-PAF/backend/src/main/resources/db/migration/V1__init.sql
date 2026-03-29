CREATE TABLE roles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(30) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(1024) NULL,
  role_id BIGINT NOT NULL,
  provider VARCHAR(30) NOT NULL,
  provider_subject VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id),
  CONSTRAINT uq_provider_subject UNIQUE (provider, provider_subject)
);

CREATE TABLE resources (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  resource_code VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(30) NOT NULL,
  description TEXT NULL,
  capacity INT NOT NULL,
  building VARCHAR(255) NOT NULL,
  floor VARCHAR(30) NULL,
  room_number VARCHAR(50) NULL,
  availability_json JSON NULL,
  status VARCHAR(30) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  updated_by BIGINT NULL,
  CONSTRAINT fk_resources_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_resources_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
  INDEX idx_resources_type_status (type, status),
  INDEX idx_resources_building (building),
  INDEX idx_resources_capacity (capacity)
);

CREATE TABLE bookings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  resource_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  purpose VARCHAR(255) NOT NULL,
  expected_attendees INT NOT NULL,
  notes TEXT NULL,
  status VARCHAR(30) NOT NULL,
  decision_reason VARCHAR(500) NULL,
  decided_by BIGINT NULL,
  decided_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bookings_resource FOREIGN KEY (resource_id) REFERENCES resources(id),
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_bookings_decided_by FOREIGN KEY (decided_by) REFERENCES users(id),
  INDEX idx_bookings_resource_date (resource_id, booking_date),
  INDEX idx_bookings_user (user_id),
  INDEX idx_bookings_status (status)
);

CREATE TABLE tickets (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ticket_number VARCHAR(30) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  resource_id BIGINT NULL,
  location_text VARCHAR(255) NULL,
  category VARCHAR(40) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL,
  preferred_contact VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL,
  assigned_technician_id BIGINT NULL,
  resolution_notes TEXT NULL,
  rejection_reason VARCHAR(500) NULL,
  created_by BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  closed_at TIMESTAMP NULL,
  CONSTRAINT fk_tickets_resource FOREIGN KEY (resource_id) REFERENCES resources(id),
  CONSTRAINT fk_tickets_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_tickets_assigned_tech FOREIGN KEY (assigned_technician_id) REFERENCES users(id),
  INDEX idx_tickets_status_priority (status, priority),
  INDEX idx_tickets_assigned (assigned_technician_id),
  INDEX idx_tickets_created_at (created_at)
);

CREATE TABLE ticket_attachments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ticket_id BIGINT NOT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  stored_file_name VARCHAR(255) NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT NOT NULL,
  storage_path VARCHAR(1024) NOT NULL,
  uploaded_by BIGINT NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_attachments_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  CONSTRAINT fk_attachments_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id),
  INDEX idx_attachments_ticket (ticket_id)
);

CREATE TABLE ticket_comments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ticket_id BIGINT NOT NULL,
  author_id BIGINT NOT NULL,
  body TEXT NOT NULL,
  edited BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_comments_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES users(id),
  INDEX idx_comments_ticket (ticket_id),
  INDEX idx_comments_created (created_at)
);

CREATE TABLE notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message VARCHAR(1000) NOT NULL,
  entity_type VARCHAR(50) NULL,
  entity_id BIGINT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user_read (user_id, is_read, created_at)
);

