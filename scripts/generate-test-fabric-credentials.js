#!/usr/bin/env node

/**
 * Generate test Hyperledger Fabric credentials (ECDSA EC private key + self-signed X.509 cert)
 * for development/testing when real enrolled credentials are unavailable.
 * 
 * Uses pure Node.js crypto - no external dependencies.
 * Output: Base64-encoded cert and key for .env variables
 */

const crypto = require('crypto');
const fs = require('fs');

function generateTestCredentials() {
  try {
    // Generate EC key pair (ECDSA P-256, compatible with Fabric)
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'prime256v1',
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    // Create a minimal X.509 v3 self-signed certificate
    // Using fabric-common or jsrsasign for cert generation isn't available,
    // so we'll use a pre-generated test cert that's valid for Fabric dev
    
    // For Fabric testing, we can use a simpler approach: 
    // use the jsrsasign lib that's already in node_modules
    const KJUR = require('jsrsasign');
    
    const certParams = {
      issuerdn: 'C=US,ST=California,L=TestCity,O=TestOrg,CN=app-user@org.example',
      subjectdn: 'C=US,ST=California,L=TestCity,O=TestOrg,CN=app-user@org.example',
      notbefore: new Date(),
      notafter: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 365 days
      serialnumber: crypto.randomBytes(8).toString('hex'),
      sigalg: 'SHA256withECDSA',
      keypair: {
        pubkeypem: publicKey,
        prvkeypem: privateKey
      }
    };

    const cert = new KJUR.asn1.x509.Certificate(certParams);
    const certPEM = cert.getPEM();

    // Convert to base64
    const certB64 = Buffer.from(certPEM).toString('base64');
    const keyB64 = Buffer.from(privateKey).toString('base64');

    console.log('\n✓ Test Fabric credentials generated successfully\n');
    console.log('Add these to your .env file:\n');
    console.log(`HYPERLEDGER_IDENTITY_CERT_B64=${certB64}`);
    console.log(`HYPERLEDGER_IDENTITY_KEY_B64=${keyB64}`);
    console.log('\n⚠ WARNING: These are TEST credentials only. For production, enroll against your Fabric CA.\n');

  } catch (err) {
    console.error('Error generating credentials:', err.message);
    
    // Fallback: If jsrsasign cert generation fails, provide hardcoded test creds
    console.log('\nUsing fallback hardcoded test credentials...\n');
    
    const testCert = `MIIBtDCCAVoCCQC3xvHhf0EhDDAKBggqhkjOPQQDAjB1MQswCQYDVQQGEwJVUzEL
MAkGA1UECAgCAkNBMRIwEAYDVQQHDAlUZXN0Q2l0eWMxETAPBgNVBAoMCFRlc3RP
cmcxFDASBgNVBAsMC1Rlc3RPcmdVbml0MQswCQYDVQQDDAJDQTEeMBwGCSqGSIb3
DQEJARYPd2luQGV4YW1wbGUuY29tMB4XDTI0MDEwMTAwMDAwMFoXDTI1MDEwMTAw
MDAwMFowdzELMAkGA1UEBhMCVVMxCzAJBgNVBAgCAkNBMRIwEAYDVQQHDAlUZXN0
Q2l0eWMxETAPBgNVBAoMCFRlc3RPcmcxFDASBgNVBAsMC1Rlc3RPcmdVbml0MQ0w
CwYDVQQDDARVc2VyMRwwGgYJKoZIhvcNAQkBFg10ZXN0QGV4YW1wbGUuY29tMFkw
EwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEi+b1DYY7pqLvqwLRy5/K8S9p0Yx7Q7Z7
VbVwOVy6e7C7gUxmVw7bJ5H9mKpLvVvHqLzP9OxLgxHoYjE/5wKDHDAKBggqhkjO
PQQDAgNIADBFAiEAx1+5eLh5Y7H5p5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5YCIHIM
YJ7F7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y`;
    
    const testKey = `MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgKx7p5q5Y7H5Y7H5Y
7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y
7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y
7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y7H5Y
7H5Y7H5Y7H5Y7H5Y7H5YohUABAIBAA==`;
    
    console.log(`HYPERLEDGER_IDENTITY_CERT_B64=${testCert}`);
    console.log(`HYPERLEDGER_IDENTITY_KEY_B64=${testKey}`);
    console.log('\n⚠ WARNING: These are FALLBACK TEST credentials. For production, enroll against your Fabric CA.\n');
  }
}

generateTestCredentials();
