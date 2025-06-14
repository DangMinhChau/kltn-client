"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "textarea"
    | "select"
    | "multiselect"
    | "checkbox"
    | "switch"
    | "file"
    | "date"
    | "datetime-local"
    | "array"
    | "object";
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{
    label: string;
    value: string | number;
    disabled?: boolean;
  }>;
  validation?: z.ZodSchema<any>;
  multiple?: boolean;
  accept?: string; // for file inputs
  max?: number; // for file uploads
  fields?: FormField[]; // for nested objects/arrays
  defaultValue?: any;
  render?: (value: any, onChange: (value: any) => void) => React.ReactNode;
}

export interface FormSection {
  title: string;
  description?: string;
  fields: FormField[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

interface AdminFormProps {
  title: string;
  description?: string;
  sections: FormSection[];
  schema: z.ZodSchema<any>;
  defaultValues?: Record<string, any>;
  onSubmit: (data: any) => Promise<void> | void;
  onCancel?: () => void;
  loading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  className?: string;
}

export function AdminForm({
  title,
  description,
  sections,
  schema,
  defaultValues = {},
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  className = "",
}: AdminFormProps) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    getValues,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
  };

  const renderField = (field: FormField, sectionIndex: number) => {
    const fieldKey = `${sectionIndex}-${field.name}`;
    const error = errors[field.name];

    switch (field.type) {
      case "text":
      case "email":
      case "password":
      case "number":
      case "date":
      case "datetime-local":
        return (
          <Controller
            key={fieldKey}
            name={field.name}
            control={control}
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
                <Input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={value || ""}
                  onChange={(e) =>
                    onChange(
                      field.type === "number"
                        ? Number(e.target.value)
                        : e.target.value
                    )
                  }
                  onBlur={onBlur}
                  ref={ref}
                  disabled={field.disabled || loading}
                  className={error ? "border-red-500" : ""}
                />
                {field.description && (
                  <p className="text-sm text-muted-foreground">
                    {field.description}
                  </p>
                )}
                {error && (
                  <p className="text-sm text-red-500">
                    {error.message as string}
                  </p>
                )}
              </div>
            )}
          />
        );

      case "textarea":
        return (
          <Controller
            key={fieldKey}
            name={field.name}
            control={control}
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  value={value || ""}
                  onChange={onChange}
                  onBlur={onBlur}
                  ref={ref}
                  disabled={field.disabled || loading}
                  className={error ? "border-red-500" : ""}
                />
                {field.description && (
                  <p className="text-sm text-muted-foreground">
                    {field.description}
                  </p>
                )}
                {error && (
                  <p className="text-sm text-red-500">
                    {error.message as string}
                  </p>
                )}
              </div>
            )}
          />
        );

      case "select":
        return (
          <Controller
            key={fieldKey}
            name={field.name}
            control={control}
            render={({ field: { onChange, value } }) => (
              <div className="space-y-2">
                <Label>
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
                <Select
                  value={value}
                  onValueChange={onChange}
                  disabled={field.disabled || loading}
                >
                  <SelectTrigger className={error ? "border-red-500" : ""}>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={String(option.value)}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.description && (
                  <p className="text-sm text-muted-foreground">
                    {field.description}
                  </p>
                )}
                {error && (
                  <p className="text-sm text-red-500">
                    {error.message as string}
                  </p>
                )}
              </div>
            )}
          />
        );

      case "checkbox":
        return (
          <Controller
            key={fieldKey}
            name={field.name}
            control={control}
            render={({ field: { onChange, value } }) => (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={field.name}
                    checked={value || false}
                    onCheckedChange={onChange}
                    disabled={field.disabled || loading}
                  />
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                </div>
                {field.description && (
                  <p className="text-sm text-muted-foreground">
                    {field.description}
                  </p>
                )}
                {error && (
                  <p className="text-sm text-red-500">
                    {error.message as string}
                  </p>
                )}
              </div>
            )}
          />
        );

      case "switch":
        return (
          <Controller
            key={fieldKey}
            name={field.name}
            control={control}
            render={({ field: { onChange, value } }) => (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  <Switch
                    id={field.name}
                    checked={value || false}
                    onCheckedChange={onChange}
                    disabled={field.disabled || loading}
                  />
                </div>
                {field.description && (
                  <p className="text-sm text-muted-foreground">
                    {field.description}
                  </p>
                )}
                {error && (
                  <p className="text-sm text-red-500">
                    {error.message as string}
                  </p>
                )}
              </div>
            )}
          />
        );

      case "file":
        return (
          <Controller
            key={fieldKey}
            name={field.name}
            control={control}
            render={({ field: { onChange, value } }) => (
              <div className="space-y-2">
                <Label>
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept={field.accept}
                    multiple={field.multiple}
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files) {
                        onChange(field.multiple ? Array.from(files) : files[0]);
                      }
                    }}
                    disabled={field.disabled || loading}
                    className={error ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={field.disabled || loading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                {field.description && (
                  <p className="text-sm text-muted-foreground">
                    {field.description}
                  </p>
                )}
                {error && (
                  <p className="text-sm text-red-500">
                    {error.message as string}
                  </p>
                )}
              </div>
            )}
          />
        );

      default:
        if (field.render) {
          return (
            <Controller
              key={fieldKey}
              name={field.name}
              control={control}
              render={({ field: { onChange, value } }) => (
                <div className="space-y-2">
                  <Label>
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>
                  {field.render!(value, onChange)}
                  {field.description && (
                    <p className="text-sm text-muted-foreground">
                      {field.description}
                    </p>
                  )}
                  {error && (
                    <p className="text-sm text-red-500">
                      {error.message as string}
                    </p>
                  )}
                </div>
              )}
            />
          );
        }
        return null;
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      toast.success("Form submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit form. Please try again.");
      console.error("Form submission error:", error);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {sections.map((section, sectionIndex) => {
          const isExpanded = section.collapsible
            ? expandedSections[section.title] ?? section.defaultExpanded ?? true
            : true;

          return (
            <Card key={section.title}>
              <CardHeader>
                <div
                  className={`flex items-center justify-between ${
                    section.collapsible ? "cursor-pointer" : ""
                  }`}
                  onClick={
                    section.collapsible
                      ? () => toggleSection(section.title)
                      : undefined
                  }
                >
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    {section.description && (
                      <CardDescription>{section.description}</CardDescription>
                    )}
                  </div>
                  {section.collapsible && (
                    <Button variant="ghost" size="sm" type="button">
                      {isExpanded ? "Collapse" : "Expand"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent className="space-y-4">
                  {section.fields.map((field, fieldIndex) => (
                    <div key={`${sectionIndex}-${fieldIndex}`}>
                      {renderField(field, sectionIndex)}
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          );
        })}

        <div className="flex items-center justify-end space-x-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading || isSubmitting}
            >
              {cancelLabel}
            </Button>
          )}
          <Button type="submit" disabled={loading || isSubmitting}>
            {loading || isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
