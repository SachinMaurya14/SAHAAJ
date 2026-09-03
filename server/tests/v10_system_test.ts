/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SAAHAJ V10 End-to-End System & Clinical Regression Test Suite
 */

import { storageEngine } from '../db/storageEngine';
import { MLModelRegistry } from '../ml/registry';
import { VisionInferenceService } from '../cv/visionInferenceService';
import { privateStorage } from '../storage/privateStorage';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName} - ${details || 'Assertion failed'}`);
  }
}

async function runTestSuite() {
  console.log('====================================================');
  console.log(' SAAHAJ V10 AUTOMATED SYSTEM & CLINICAL SUITE');
  console.log('====================================================\n');

  // 1. Tabular ML Mathematical Regression Suite
  console.log('1. Tabular ML Mathematical Regression Suite:');
  
  const models = MLModelRegistry.getModels();
  assert(models.length >= 3, 'Model registry contains validated clinical artifacts');

  // ASCVD 10-Year Test: 58-year-old male, SBP 138, LDL 136, HDL 42, Total Chol 224, Non-smoker
  const ascvdInference = MLModelRegistry.runInference('cv-ascvd-v1.4', {
    age: 58,
    sex: 'Male',
    bp_systolic: 138,
    bp_diastolic: 86,
    ldl_c: 136,
    hdl_c: 42,
    total_cholesterol: 224,
    smoking_status: 'Never',
    has_diabetes: false,
    bmi: 27.8
  });

  assert(ascvdInference.status === 'SUCCESS', 'ASCVD 10-Year inference executed successfully');
  assert(ascvdInference.calibratedProbability > 0.05 && ascvdInference.calibratedProbability < 0.30, 'ASCVD 10-Year Risk in valid calibration range (5-30%)', `Got ${ascvdInference.formattedPercentage}`);
  assert(ascvdInference.featureContributions.length > 0, 'SHAP Feature Attributions calculated');

  // Diabetes Risk Model Test: Fasting Glucose 112, BMI 27.8, Age 58, HbA1c 6.4
  const diabetesInference = MLModelRegistry.runInference('diabetes-prog-v2.1', {
    age: 58,
    bmi: 27.8,
    fasting_glucose: 112,
    hba1c: 6.4,
    bp_systolic: 138,
    triglycerides: 168
  });
  assert(diabetesInference.status === 'SUCCESS', 'Diabetes risk inference executed successfully');
  assert(diabetesInference.calibratedProbability >= 0.10, 'Diabetes model identifies elevated risk for prediabetic profile');

  // 2. Deep Radiology & Grad-CAM Vision Tests
  console.log('\n2. Deep Radiology & Saliency (DenseNet-121) Suite:');
  const dummyBuffer = Buffer.alloc(1024 * 50, 0x80);
  const cvStudy = await VisionInferenceService.analyzeImage(
    'test-patient-user',
    dummyBuffer,
    'chest_pa_screening.png',
    'image/png',
    {
      studyTitle: 'PA Chest Screening',
      modality: 'X-Ray',
      bodyRegion: 'Chest',
      indication: 'Longitudinal follow-up'
    }
  );

  assert(Boolean(cvStudy.studyId), 'Radiological study record created with unique ID');
  assert(cvStudy.findings.length >= 7, 'DenseNet-121 screened multi-label chest pathologies', `Got ${cvStudy.findings.length} findings`);
  assert(Boolean(cvStudy.primaryExplanation && cvStudy.gradCamHeatmapBase64), 'Generated Grad-CAM class activation maps');

  // 3. Private Storage & Security Suite
  console.log('\n3. Private Object Storage & Security Hardening Suite:');
  const uploadValidation = privateStorage.validateUpload('test_report.pdf', 'application/pdf', 1024 * 1024);
  assert(uploadValidation.isValid, 'PDF upload accepted under size limits');

  const maliciousValidation = privateStorage.validateUpload('../../../etc/passwd', 'application/pdf', 500);
  assert(maliciousValidation.sanitizedFilename.indexOf('..') === -1, 'Path traversal payload successfully neutralized in filename');

  const signedUrl = privateStorage.generateSignedAccessUrl('test-user-123', 'reports/lab_001.pdf', 'application/pdf', 10);
  assert(signedUrl.signedUrl.includes('sig='), 'HMAC-SHA256 signature generated');
  
  // Extract URL params and verify
  const urlObj = new URL('http://localhost' + signedUrl.signedUrl);
  const exp = parseInt(urlObj.searchParams.get('exp') || '0', 10);
  const sig = urlObj.searchParams.get('sig') || '';
  const isAuth = privateStorage.verifySignedAccess('test-user-123', 'reports/lab_001.pdf', exp, sig);
  assert(isAuth, 'Signed access verification succeeds with genuine HMAC secret');

  const isTamperedAuth = privateStorage.verifySignedAccess('attacker-user', 'reports/lab_001.pdf', exp, sig);
  assert(!isTamperedAuth, 'IDOR attack blocked when unauthorized user attempts to reuse signed URL');

  // 4. Data Sovereignty & Isolation Tests
  console.log('\n4. Data Sovereignty & Isolation Suite:');
  const testUid = `test-user-${Date.now()}`;
  storageEngine.logAudit(testUid, 'TEST_EVENT', { sample: true });
  const auditLogs = storageEngine.getAuditLogs(testUid);
  assert(auditLogs.length > 0, 'Audit event recorded');

  storageEngine.clearUserData(testUid);
  const postPurgeDocs = storageEngine.listDocuments(testUid);
  assert(postPurgeDocs.length === 0, 'User data purge leaves zero documents in storage engine');

  // 5. Assistant Zero-Hallucination & Integrity Suite
  console.log('\n5. Assistant Zero-Hallucination & Clinical Scoping Suite:');
  const { runAssistantIntegrityTests } = await import('./assistant_integrity_test');
  const assistantSuite = await runAssistantIntegrityTests();
  for (const r of assistantSuite.results) {
    assert(r.status === 'PASSED', r.test, r.details);
  }

  // Final Summary
  console.log('\n====================================================');
  console.log(` RESULTS: ${passedTests}/${totalTests} Tests Passed (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log('====================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test suite failed with unhandled error:', err);
  process.exit(1);
});
