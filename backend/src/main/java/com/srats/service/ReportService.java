package com.srats.service;

import com.srats.dto.AttendanceDto;
import com.srats.entity.AttendanceRecord;
import com.srats.entity.User;
import com.srats.repository.ClassSessionRepository;
import com.srats.repository.UserRepository;
import com.srats.repository.AttendanceRecordRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ReportService {

    @Autowired private UserRepository userRepo;
    @Autowired private ClassSessionRepository sessionRepo;
    @Autowired private AttendanceRecordRepository attendanceRepo;

    public byte[] generateExamEligibilityExcel(String department, String subject) throws IOException {
        List<User> students = userRepo.findByRoleAndDepartment(User.Role.STUDENT, department);
        long totalSessions = sessionRepo.countBySubjectAndTeacher_Department(subject, department);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Exam Eligibility");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // Create Header Row
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Student Name", "Roll Number", "Subject", "Total Classes", "Classes Attended", "Attendance %", "Eligibility Status"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Fill Data
            int rowIdx = 1;
            for (User student : students) {
                long attended = attendanceRepo.countByStudentAndSession_SubjectAndStatus(student, subject, AttendanceRecord.Status.PRESENT);
                double percentage = totalSessions > 0 ? (double) attended / totalSessions * 100 : 0.0;
                boolean eligible = percentage >= 65.0;

                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(student.getName());
                row.createCell(1).setCellValue(student.getRollNo());
                row.createCell(2).setCellValue(subject);
                row.createCell(3).setCellValue(totalSessions);
                row.createCell(4).setCellValue(attended);
                row.createCell(5).setCellValue(String.format("%.2f%%", percentage));
                row.createCell(6).setCellValue(eligible ? "Eligible" : "Not Eligible");

                if (!eligible) {
                    CellStyle redStyle = workbook.createCellStyle();
                    Font redFont = workbook.createFont();
                    redFont.setColor(IndexedColors.RED.getIndex());
                    redStyle.setFont(redFont);
                    row.getCell(6).setCellStyle(redStyle);
                }
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    /** Returns list of students below 75% attendance threshold */
    public List<Map<String, Object>> getDefaulters(double threshold) {
        List<User> students = userRepo.findByRole(User.Role.STUDENT);
        List<Map<String, Object>> result = new ArrayList<>();

        for (User s : students) {
            List<AttendanceDto.SubjectAttendance> subjects = getSubjectWise(s);
            for (AttendanceDto.SubjectAttendance sa : subjects) {
                if (sa.getPercentage() < threshold) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("studentId", s.getId());
                    row.put("name", s.getName());
                    row.put("rollNo", s.getRollNo());
                    row.put("department", s.getDepartment());
                    row.put("subject", sa.getSubject());
                    row.put("percentage", sa.getPercentage());
                    row.put("present", sa.getPresent());
                    row.put("total", sa.getTotal());
                    // Classes needed to reach threshold
                    long needed = 0;
                    if (sa.getTotal() > 0) {
                        // p+x / (t+x) >= threshold/100 → solve for x
                        double thr = threshold / 100.0;
                        needed = Math.max(0, (long) Math.ceil(
                                (thr * sa.getTotal() - sa.getPresent()) / (1 - thr)));
                    }
                    row.put("classesNeeded", needed);
                    result.add(row);
                }
            }
        }
        // Sort by percentage ascending
        result.sort(Comparator.comparingDouble(r -> ((Number) r.get("percentage")).doubleValue()));
        return result;
    }

    /** Daily attendance trend for a teacher's subject */
    public List<Map<String, Object>> getTrend(String subject, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<Object[]> rows = attendanceRepo.getDailyTrend(subject, since);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("date", row[0].toString());
            point.put("present", ((Number) row[1]).longValue());
            result.add(point);
        }
        return result;
    }

    private List<AttendanceDto.SubjectAttendance> getSubjectWise(User student) {
        List<Object[]> rows = attendanceRepo.getSubjectWiseStats(student);
        List<AttendanceDto.SubjectAttendance> result = new ArrayList<>();
        for (Object[] row : rows) {
            AttendanceDto.SubjectAttendance sa = new AttendanceDto.SubjectAttendance();
            sa.setSubject((String) row[0]);
            sa.setTotal(((Number) row[1]).longValue());
            sa.setPresent(((Number) row[2]).longValue());
            sa.setAbsent(sa.getTotal() - sa.getPresent());
            sa.setPercentage(sa.getTotal() == 0 ? 0 : (sa.getPresent() * 100.0 / sa.getTotal()));
            sa.setStatusLabel(sa.getPercentage() >= 75 ? "GOOD"
                    : sa.getPercentage() >= 65 ? "LOW" : "CRITICAL");
            result.add(sa);
        }
        return result;
    }
}
