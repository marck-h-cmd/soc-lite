import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Boolean, Integer, BigInteger, Numeric,
    DateTime, ForeignKey, Table
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET, ARRAY, ENUM as PG_ENUM
from sqlalchemy.orm import relationship
from .session import Base

# Tipos ENUM nativos de PostgreSQL definidos en schema.sql
severity_level_enum = PG_ENUM('critical', 'high', 'medium', 'low', 'info', name='severity_level', create_type=False)
alert_status_enum = PG_ENUM('pending', 'in_progress', 'triaged', 'escalated', 'closed', 'false_positive', name='alert_status', create_type=False)
triage_verdict_enum = PG_ENUM('malicious', 'suspicious', 'benign', 'false_positive', 'unknown', name='triage_verdict', create_type=False)
incident_status_enum = PG_ENUM('open', 'investigating', 'contained', 'resolved', 'closed', name='incident_status', create_type=False)
report_type_enum = PG_ENUM('operational_daily', 'executive_monthly', 'compliance_audit', name='report_type', create_type=False)
report_format_enum = PG_ENUM('pdf', 'docx', 'xlsx', 'json', name='report_format', create_type=False)
audit_action_enum = PG_ENUM('create', 'read', 'update', 'delete', 'export', 'login', 'triage', 'escalate', name='audit_action', create_type=False)
audit_result_enum = PG_ENUM('success', 'failure', 'denied', name='audit_result', create_type=False)

# Tabla intermedia de asignación de permisos a roles
role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True)
)


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    is_system = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    users = relationship("User", back_populates="role")
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles", lazy="selectin")


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    module = Column(String(50), nullable=False)
    action = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)

    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    role = relationship("Role", back_populates="users", lazy="selectin")
    incidents = relationship("Incident", back_populates="assigned_user")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    external_id = Column(String(100), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    source = Column(String(100), nullable=False)
    severity = Column(severity_level_enum, nullable=False, default="medium", index=True)
    status = Column(alert_status_enum, nullable=False, default="pending", index=True)
    source_ip = Column(INET, nullable=True, index=True)
    destination_ip = Column(INET, nullable=True)
    raw_payload = Column(JSONB, nullable=False, default=dict)
    tags = Column(ARRAY(Text), default=list)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    enrichment = relationship("EnrichmentData", back_populates="alert", uselist=False, cascade="all, delete-orphan", lazy="selectin")
    triage_result = relationship("TriageResult", back_populates="alert", uselist=False, cascade="all, delete-orphan", lazy="selectin")
    incidents = relationship("Incident", back_populates="alert", cascade="all, delete-orphan")


class EnrichmentData(Base):
    __tablename__ = "enrichment_data"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    alert_id = Column(UUID(as_uuid=True), ForeignKey("alerts.id", ondelete="CASCADE"), unique=True, nullable=False)
    virustotal = Column(JSONB, default=dict)
    abuseipdb = Column(JSONB, default=dict)
    geoip = Column(JSONB, default=dict)
    whois = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    alert = relationship("Alert", back_populates="enrichment")


class TriageResult(Base):
    __tablename__ = "triage_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    alert_id = Column(UUID(as_uuid=True), ForeignKey("alerts.id", ondelete="CASCADE"), unique=True, nullable=False)
    verdict = Column(triage_verdict_enum, nullable=False, index=True)
    severity = Column(severity_level_enum, nullable=False)
    confidence = Column(Numeric(4, 3), nullable=False)
    reasoning = Column(Text, nullable=False)
    recommended_actions = Column(ARRAY(Text), default=list)
    ai_model = Column(String(100), nullable=False)
    execution_mode = Column(String(20), nullable=False, index=True)  # 'llm' or 'degraded'
    execution_time_ms = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    alert = relationship("Alert", back_populates="triage_result")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    alert_id = Column(UUID(as_uuid=True), ForeignKey("alerts.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    severity = Column(severity_level_enum, nullable=False)
    status = Column(incident_status_enum, nullable=False, default="open", index=True)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    ticket_reference = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    alert = relationship("Alert", back_populates="incidents", lazy="selectin")
    assigned_user = relationship("User", back_populates="incidents", lazy="selectin")
    tickets = relationship("Ticket", back_populates="incident", cascade="all, delete-orphan", lazy="selectin")


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    external_system = Column(String(50), nullable=False)
    ticket_id = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False)
    response_payload = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    incident = relationship("Incident", back_populates="tickets")


class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    username = Column(String(150), nullable=False, index=True)
    ip_address = Column(INET, nullable=True)
    module = Column(String(50), nullable=False, index=True)
    action = Column(audit_action_enum, nullable=False)
    target_id = Column(String(100), nullable=True)
    details = Column(JSONB, default=dict)
    result = Column(audit_result_enum, nullable=False)
    prev_hash = Column(String(64), nullable=False)
    curr_hash = Column(String(64), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_type = Column(report_type_enum, nullable=False)
    format = Column(report_format_enum, nullable=False)
    generated_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    file_path = Column(String(500), nullable=False)
    file_size = Column(BigInteger, nullable=False)
    parameters = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String(100), primary_key=True)
    value = Column(JSONB, nullable=False)
    description = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
