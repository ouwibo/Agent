# Agent Skills Index

Semua skill agent konsolidasi di `Skills/ouwibo-skill/`. **102 skill** siap aktivasi — cukup baca `SKILL.md` dalam direktori skill yang relevan.

---

## 📁 Struktur

```
Skills/
└── all-skills/
    ├── 401-403-bypass-techniques/
    ├── active-directory-acl-abuse/
    ├── active-directory-certificate-services/
    ├── active-directory-kerberos-attacks/
    ├── ai-ml-security/
    ├── android-pentesting-tricks/
    ├── anti-debugging-techniques/
    ├── api-auth-and-jwt-abuse/
    ├── api-authorization-and-bola/
    ├── api-recon-and-docs/
    ├── api-sec/
    ├── arbitrary-write-to-rce/
    ├── auth-sec/
    ├── authbypass-authentication-flaws/
    ├── binary-protection-bypass/
    ├── browser-exploitation-v8/
    ├── business-logic-vulnerabilities/
    ├── classical-cipher-analysis/
    ├── clickjacking/
    ├── cmdi-command-injection/
    ├── code-obfuscation-deobfuscation/
    ├── container-escape-techniques/
    ├── cors-cross-origin-misconfiguration/
    ├── crlf-injection/
    ├── csp-bypass-advanced/
    ├── csrf-cross-site-request-forgery/
    ├── csv-formula-injection/
    ├── dangling-markup-injection/
    ├── defi-attack-patterns/
    ├── dependency-confusion/
    ├── deserialization-insecure/
    ├── dns-rebinding-attacks/
    ├── email-header-injection/
    ├── expression-language-injection/
    ├── file-access-vuln/
    ├── format-string-exploitation/
    ├── ghost-bits-cast-attack/
    ├── graphql-and-hidden-parameters/
    ├── hash-attack-techniques/
    ├── heap-exploitation/
    ├── http-host-header-attacks/
    ├── http-parameter-pollution/
    ├── http2-specific-attacks/
    ├── idor-broken-object-authorization/
    ├── injection-checking/
    ├── insecure-source-code-management/
    ├── ios-pentesting-tricks/
    ├── jndi-injection/
    ├── jwt-oauth-token-attacks/
    ├── kernel-exploitation/
    ├── kubernetes-pentesting/
    ├── lattice-crypto-attacks/
    ├── linux-lateral-movement/
    ├── linux-privilege-escalation/
    ├── linux-security-bypass/
    ├── llm-prompt-injection/
    ├── macos-process-injection/
    ├── macos-security-bypass/
    ├── memory-forensics-volatility/
    ├── mobile-ssl-pinning-bypass/
    ├── network-protocol-attacks/
    ├── nosql-injection/
    ├── ntlm-relay-coercion/
    ├── oauth-oidc-misconfiguration/
    ├── open-redirect/
    ├── path-traversal-lfi/
    ├── prototype-pollution/
    ├── prototype-pollution-advanced/
    ├── race-condition/
    ├── recon-and-methodology/
    ├── recon-for-sec/
    ├── request-smuggling/
    ├── reverse-shell-techniques/
    ├── rsa-attack-techniques/
    ├── saml-sso-assertion-attacks/
    ├── sandbox-escape-techniques/
    ├── smart-contract-vulnerabilities/
    ├── sqli-sql-injection/
    ├── ssrf-server-side-request-forgery/
    ├── ssti-server-side-template-injection/
    ├── stack-overflow-and-rop/
    ├── steganography-techniques/
    ├── subdomain-takeover/
    ├── symbolic-execution-tools/
    ├── symmetric-cipher-attacks/
    ├── traffic-analysis-pcap/
    ├── tunneling-and-pivoting/
    ├── type-juggling/
    ├── unauthorized-access-common-services/
    ├── uniswap-ai/
    ├── upload-insecure-files/
    ├── vm-and-bytecode-reverse/
    ├── waf-bypass-techniques/
    ├── web-cache-deception/
    ├── websocket-security/
    ├── windows-av-evasion/
    ├── windows-lateral-movement/
    ├── windows-privilege-escalation/
    ├── xslt-injection/
    ├── xss-cross-site-scripting/
    ├── xxe-xml-external-entity/
    └── zopenclaw/
```

---

## 🎯 Quick Reference

| Need | Skill |
|------|-------|
| Web XSS/SQLi/SSRF | `xss-cross-site-scripting/`, `sqli-sql-injection/`, `ssrf-server-side-request-forgery/` |
| API security | `api-sec/`, `api-auth-and-jwt-abuse/`, `api-authorization-and-bola/` |
| AD / Kerberos | `active-directory-kerberos-attacks/`, `active-directory-acl-abuse/` |
| Windows privesc | `windows-privilege-escalation/`, `windows-lateral-movement/` |
| Linux privesc | `linux-privilege-escalation/`, `linux-lateral-movement/` |
| Mobile pentest | `android-pentesting-tricks/`, `ios-pentesting-tricks/`, `mobile-ssl-pinning-bypass/` |
| Container/K8s | `container-escape-techniques/`, `kubernetes-pentesting/` |
| DeFi / Crypto | `defi-attack-patterns/`, `uniswap-ai/`, `smart-contract-vulnerabilities/` |
| Reverse engineering | `vm-and-bytecode-reverse/`, `binary-protection-bypass/` |
| Network tunneling | `tunneling-and-pivoting/`, `network-protocol-attacks/` |
| OAuth/OIDC | `oauth-oidc-misconfiguration/`, `jwt-oauth-token-attacks/` |

---

## ⚡ Cara Aktivasi

Baca `SKILL.md` di direktori skill yang relevan. Contoh:

```
agent/Skills/ouwibo-skill/xss-cross-site-scripting/SKILL.md
agent/Skills/ouwibo-skill/uniswap-ai/SKILL.md
agent/Skills/ouwibo-skill/zopenclaw/SKILL.md
```

Skill aktif saat agent membacanya — tidak perlu install额外. Hapus folder `Skills/` lama jika masih ada duplikat.

---

*Auto-generated — update jika struktur berubah*
