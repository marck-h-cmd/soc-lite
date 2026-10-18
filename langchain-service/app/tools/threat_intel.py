import ipaddress
from typing import Dict, Any, Optional
import httpx
from ..config import settings


def is_private_ip(ip: str) -> bool:
    try:
        obj = ipaddress.ip_address(ip)
        return obj.is_private or obj.is_loopback or obj.is_reserved
    except ValueError:
        return False


async def query_virustotal(ip: str) -> Dict[str, Any]:
    if is_private_ip(ip):
        return {
            "malicious_votes": 0,
            "harmless_votes": 100,
            "community_score": 100,
            "tags": ["rfc1918", "internal-network", "trusted"],
            "reputation": "internal"
        }

    # Si hay clave configurada, intentar llamada real
    if settings.VIRUSTOTAL_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(
                    f"https://www.virustotal.com/api/v3/ip_addresses/{ip}",
                    headers={"x-apikey": settings.VIRUSTOTAL_API_KEY}
                )
                if resp.status_code == 200:
                    data = resp.json().get("data", {}).get("attributes", {})
                    stats = data.get("last_analysis_stats", {})
                    return {
                        "malicious_votes": stats.get("malicious", 0),
                        "harmless_votes": stats.get("harmless", 0),
                        "community_score": data.get("reputation", 0),
                        "tags": data.get("tags", []),
                        "reputation": "malicious" if stats.get("malicious", 0) > 5 else "neutral"
                    }
        except Exception:
            pass

    # Heurística de simulación basada en octetos para emulación de laboratorio SOC
    octets = [int(x) for x in ip.split(".") if x.isdigit()]
    first = octets[0] if octets else 0

    if first in [185, 45, 194, 91, 103]:
        return {
            "malicious_votes": 28,
            "harmless_votes": 2,
            "community_score": -65,
            "tags": ["c2", "tor-exit", "scanner", "botnet"],
            "reputation": "malicious"
        }
    elif first in [8, 1, 9]:
        return {
            "malicious_votes": 0,
            "harmless_votes": 85,
            "community_score": 90,
            "tags": ["public-dns", "anycast", "cdn"],
            "reputation": "benign"
        }
    else:
        return {
            "malicious_votes": 4,
            "harmless_votes": 12,
            "community_score": -5,
            "tags": ["cloud-provider", "scanner"],
            "reputation": "suspicious"
        }


async def query_abuseipdb(ip: str) -> Dict[str, Any]:
    if is_private_ip(ip):
        return {
            "abuseConfidenceScore": 0,
            "totalReports": 0,
            "isWhitelisted": True,
            "usageType": "Local Corporate Network",
            "lastReportedAt": None
        }

    if settings.ABUSEIPDB_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(
                    "https://api.abuseipdb.com/api/v2/check",
                    params={"ipAddress": ip, "maxAgeInDays": 90},
                    headers={"Key": settings.ABUSEIPDB_API_KEY, "Accept": "application/json"}
                )
                if resp.status_code == 200:
                    data = resp.json().get("data", {})
                    return {
                        "abuseConfidenceScore": data.get("abuseConfidenceScore", 0),
                        "totalReports": data.get("totalReports", 0),
                        "isWhitelisted": data.get("isWhitelisted", False),
                        "usageType": data.get("usageType", "Unknown"),
                        "lastReportedAt": data.get("lastReportedAt")
                    }
        except Exception:
            pass

    octets = [int(x) for x in ip.split(".") if x.isdigit()]
    first = octets[0] if octets else 0

    if first in [185, 45, 194]:
        return {
            "abuseConfidenceScore": 96,
            "totalReports": 380,
            "isWhitelisted": False,
            "usageType": "Data Center/Web Hosting/Transit",
            "lastReportedAt": "2026-10-18T12:00:00Z"
        }
    elif first in [103, 91]:
        return {
            "abuseConfidenceScore": 78,
            "totalReports": 64,
            "isWhitelisted": False,
            "usageType": "Commercial Proxy",
            "lastReportedAt": "2026-10-18T10:30:00Z"
        }
    else:
        return {
            "abuseConfidenceScore": 15,
            "totalReports": 3,
            "isWhitelisted": False,
            "usageType": "ISP / Broadband",
            "lastReportedAt": "2026-10-15T08:00:00Z"
        }


async def query_geoip(ip: str) -> Dict[str, Any]:
    if is_private_ip(ip):
        return {
            "country_name": "Red Privada Local (LAN)",
            "country_code": "LAN",
            "city": "Sede Corporativa",
            "asn": 0,
            "isp": "Infraestructura Interna",
            "latitude": 0.0,
            "longitude": 0.0
        }

    octets = [int(x) for x in ip.split(".") if x.isdigit()]
    first = octets[0] if octets else 0

    geo_map = {
        185: {"country_name": "Rusia", "country_code": "RU", "city": "Moscú", "asn": 44050, "isp": "BadHost Networks"},
        45: {"country_name": "Seychelles", "country_code": "SC", "city": "Victoria", "asn": 60112, "isp": "DarkCloud Hosting"},
        194: {"country_name": "Países Bajos", "country_code": "NL", "city": "Ámsterdam", "asn": 20473, "isp": "Choopa LLC"},
        103: {"country_name": "China", "country_code": "CN", "city": "Hangzhou", "asn": 37963, "isp": "Alibaba Cloud"},
        8: {"country_name": "Estados Unidos", "country_code": "US", "city": "Mountain View", "asn": 15169, "isp": "Google LLC"},
        1: {"country_name": "Australia", "country_code": "AU", "city": "Sídney", "asn": 13335, "isp": "Cloudflare Inc"}
    }

    info = geo_map.get(first, {
        "country_name": "Alemania",
        "country_code": "DE",
        "city": "Fráncfort",
        "asn": 24940,
        "isp": "Hetzner Online GmbH"
    })
    return info


async def query_whois(ip: str) -> Dict[str, Any]:
    if is_private_ip(ip):
        return {
            "network_name": "RFC1918-PRIVATE",
            "cidr": "192.168.0.0/16",
            "organization": "Infraestructura Local",
            "allocated_date": "1996-02-01"
        }

    octets = [int(x) for x in ip.split(".") if x.isdigit()]
    first = octets[0] if octets else 0
    return {
        "network_name": f"NET-{first}-ALLOCATION",
        "cidr": f"{ip}/24",
        "organization": "Autonomous System Operator",
        "allocated_date": "2018-05-14"
    }


async def enrich_threat_intel(ip: Optional[str]) -> Dict[str, Any]:
    if not ip:
        return {
            "virustotal": {},
            "abuseipdb": {},
            "geoip": {},
            "whois": {}
        }

    vt = await query_virustotal(ip)
    abuse = await query_abuseipdb(ip)
    geo = await query_geoip(ip)
    whois = await query_whois(ip)

    return {
        "virustotal": vt,
        "abuseipdb": abuse,
        "geoip": geo,
        "whois": whois
    }
