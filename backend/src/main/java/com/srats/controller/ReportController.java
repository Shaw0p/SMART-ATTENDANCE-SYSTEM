package com.srats.controller;

import com.srats.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired private ReportService reportService;

    @GetMapping("/exam-eligibility")
    public ResponseEntity<byte[]> downloadExamEligibilityReport(
            @RequestParam String departmentId,
            @RequestParam String subjectCode) {
        try {
            byte[] excelContent = reportService.generateExamEligibilityExcel(departmentId, subjectCode);

            String filename = "Exam_Eligibility_" + departmentId + "_" + subjectCode + ".xlsx";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(excelContent);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
