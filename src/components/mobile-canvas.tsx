// @ts-nocheck
'use client';

"use client";

import { DesignCanvas, DCSection, DCArtboard } from "@/components/erp/design-canvas";
import {
  DriverApp,
  FieldSalesApp,
  EmployeeApp,
  ProductionApp,
} from "@/components/erp/mobile";
import {
  DriverHistory,
  DriverPOD,
  DriverVehicleCheck,
  SalesCustomer,
  SalesNewOrder,
  SalesHistory,
  EmpLeave,
  EmpPayslips,
  EmpProfile,
  ProdQC,
  ProdIssue,
  ProdLog,
  OwnerApp,
  OwnerApprovals,
  StoreStockCheck,
  StoreReceive,
} from "@/components/erp/mobile2";

export function MobileCanvasRoot() {
  return (
    <DesignCanvas storageKey="sudarshan-mobile-v3" initialZoom={0.7}>
      <DCSection
        id="driver"
        title="Driver app"
        subtitle="For truck drivers on dispatch · GPS tracking, POD, vehicle inspection"
      >
        <DCArtboard id="d-vehicle" label="Pre-trip vehicle check" width={380} height={780}>
          <DriverVehicleCheck />
        </DCArtboard>
        <DCArtboard id="d-active" label="Active dispatch" width={380} height={780}>
          <DriverApp />
        </DCArtboard>
        <DCArtboard id="d-pod" label="Proof of delivery" width={380} height={780}>
          <DriverPOD />
        </DCArtboard>
        <DCArtboard id="d-history" label="Trip history" width={380} height={780}>
          <DriverHistory />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="sales"
        title="Field sales app"
        subtitle="For sales reps in field · beat tracking, customer 360°, mobile order entry"
      >
        <DCArtboard id="s-home" label="Today · beat plan" width={380} height={780}>
          <FieldSalesApp />
        </DCArtboard>
        <DCArtboard id="s-customer" label="Customer 360°" width={380} height={780}>
          <SalesCustomer />
        </DCArtboard>
        <DCArtboard id="s-order" label="New order entry" width={380} height={780}>
          <SalesNewOrder />
        </DCArtboard>
        <DCArtboard id="s-history" label="Visit history" width={380} height={780}>
          <SalesHistory />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="employee"
        title="Employee app (HRMS)"
        subtitle="For all staff · attendance, leave, payslip, documents"
      >
        <DCArtboard id="e-home" label="Attendance home" width={380} height={780}>
          <EmployeeApp />
        </DCArtboard>
        <DCArtboard id="e-leave" label="Apply for leave" width={380} height={780}>
          <EmpLeave />
        </DCArtboard>
        <DCArtboard id="e-payslip" label="Payslips list" width={380} height={780}>
          <EmpPayslips />
        </DCArtboard>
        <DCArtboard id="e-profile" label="Profile & documents" width={380} height={780}>
          <EmpProfile />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="production"
        title="Production floor app"
        subtitle="For line operators & supervisors · batch logging, QC, issue reporting"
      >
        <DCArtboard id="p-line" label="Line status" width={380} height={780}>
          <ProductionApp />
        </DCArtboard>
        <DCArtboard id="p-qc" label="QC checklist" width={380} height={780}>
          <ProdQC />
        </DCArtboard>
        <DCArtboard id="p-log" label="Hourly batch log" width={380} height={780}>
          <ProdLog />
        </DCArtboard>
        <DCArtboard id="p-issue" label="Report issue" width={380} height={780}>
          <ProdIssue />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="owner"
        title="Owner app"
        subtitle="For Rajiv Mehta · KPI snapshot, approvals on the go"
      >
        <DCArtboard id="o-home" label="Group KPI snapshot" width={380} height={780}>
          <OwnerApp />
        </DCArtboard>
        <DCArtboard id="o-approve" label="Approvals queue" width={380} height={780}>
          <OwnerApprovals />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="store"
        title="Store / Inventory app"
        subtitle="For stores team · scan, check stock, receive shipments"
      >
        <DCArtboard id="st-scan" label="Stock check & scan" width={380} height={780}>
          <StoreStockCheck />
        </DCArtboard>
        <DCArtboard id="st-receive" label="Receive shipment" width={380} height={780}>
          <StoreReceive />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}
