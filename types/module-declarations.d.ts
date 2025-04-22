// Module declarations for modules without type definitions

declare module 'swagger-ui-react';

declare module '@/components/ui/alert' {
  export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'destructive' | 'warning';
  }
  export const Alert: React.FC<AlertProps>;
  export const AlertTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>>;
  export const AlertDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>>;
}

declare module '@/components/ui/table' {
  export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}
  export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
  export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
  export interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
  export interface TableHeadProps extends React.HTMLAttributes<HTMLTableCellElement> {}
  export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}
  export interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
    colSpan?: number;
  }
  export interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {}

  export const Table: React.FC<TableProps>;
  export const TableHeader: React.FC<TableHeaderProps>;
  export const TableBody: React.FC<TableBodyProps>;
  export const TableFooter: React.FC<TableFooterProps>;
  export const TableHead: React.FC<TableHeadProps>;
  export const TableRow: React.FC<TableRowProps>;
  export const TableCell: React.FC<TableCellProps>;
  export const TableCaption: React.FC<TableCaptionProps>;
}

declare module '@/components/ui/pagination' {
  export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {}
  export interface PaginationContentProps extends React.HTMLAttributes<HTMLUListElement> {}
  export interface PaginationItemProps extends React.HTMLAttributes<HTMLLIElement> {}
  export interface PaginationLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
    isActive?: boolean;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
  }
  export interface PaginationEllipsisProps extends React.HTMLAttributes<HTMLSpanElement> {}

  export const Pagination: React.FC<PaginationProps>;
  export const PaginationContent: React.FC<PaginationContentProps>;
  export const PaginationItem: React.FC<PaginationItemProps>;
  export const PaginationLink: React.FC<PaginationLinkProps>;
  export const PaginationEllipsis: React.FC<PaginationEllipsisProps>;
  export const PaginationNext: React.FC<PaginationLinkProps>;
  export const PaginationPrevious: React.FC<PaginationLinkProps>;
}

declare module '@/components/ui/accordion' {
  export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
    type?: 'single' | 'multiple';
    collapsible?: boolean;
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
  }
  export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
  }
  export interface AccordionTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {}
  export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {}

  export const Accordion: React.FC<AccordionProps>;
  export const AccordionItem: React.FC<AccordionItemProps>;
  export const AccordionTrigger: React.FC<AccordionTriggerProps>;
  export const AccordionContent: React.FC<AccordionContentProps>;
}

declare module '@/components/ui/date-picker' {
  export interface DatePickerProps {
    date?: Date;
    onSelect: (date: Date) => void;
  }
  export const DatePicker: React.FC<DatePickerProps>;
}

// Define Badge component to fix variant issues
declare module '@/components/ui/badge' {
  export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'warning';
  }
  export const Badge: React.FC<BadgeProps>;
} 