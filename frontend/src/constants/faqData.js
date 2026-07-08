import {
  CheckSquare,
  Box,
  ArrowLeftRight,
  ClipboardList,
  Star,
  AlertCircle,
  Truck,
  Tag,
  User,
  HelpCircle,
} from 'lucide-react';

/**
 * FAQ page data.
 * Extracted from FAQ.jsx to decouple content from component logic.
 * Each item has a stable `id` (replacing array index as key).
 */
export const FAQ_DATA = [
  {
    id: 'faq-payment',
    title: 'Payment',
    content: 'We accept Visa, Mastercard, American Express, Apple Pay, Google Pay, and Cash on Delivery (COD). All online payments are securely processed and encrypted.',
    iconName: 'CheckSquare',
  },
  {
    id: 'faq-order',
    title: 'Order',
    content: 'You can modify or cancel your order within 2 hours of placing it by emailing our customer support team.',
    iconName: 'Box',
  },
  {
    id: 'faq-returns',
    title: 'Returns & Exchange',
    content: "If an item doesn't fit or you're not happy, you can return or swap it within 30 days of purchase. Items must be unopened and unused.",
    iconName: 'ArrowLeftRight',
  },
  {
    id: 'faq-package',
    title: 'Package',
    content: 'All items are securely packaged to ensure they reach you in perfect condition. We use eco-friendly materials wherever possible.',
    iconName: 'ClipboardList',
  },
  {
    id: 'faq-offers',
    title: 'Special Offers',
    content: 'Sign up for our newsletter to receive updates on special offers, seasonal sales, and exclusive discounts for members.',
    iconName: 'Star',
  },
  {
    id: 'faq-damage',
    title: 'Damage',
    content: 'If you receive a damaged item, please contact us immediately with photos of the product and packaging for a fast replacement.',
    iconName: 'AlertCircle',
  },
  {
    id: 'faq-shipment',
    title: 'Shipment',
    content: 'We ship orders worldwide. Domestic orders take 3-5 business days to arrive, while international shipping ranges between 7-14 business days.',
    iconName: 'Truck',
  },
  {
    id: 'faq-purchase',
    title: 'Purchase',
    content: 'Once a purchase is confirmed, you will receive an email with your order details and a tracking link to monitor your delivery status.',
    iconName: 'Tag',
  },
  {
    id: 'faq-customer-care',
    title: 'Customer Care Service',
    content: 'You can submit an inquiry through our Contact form, write to us directly, or call our customer service hotline at 1-800-FABISH-SKIN.',
    iconName: 'User',
  },
  {
    id: 'faq-refund',
    title: 'Refund',
    content: 'Once we receive your return item in our warehouse, we process the inspection and issue refunds within 5-7 business days to your original payment method.',
    iconName: 'HelpCircle',
  },
];

/**
 * Icon map for FAQ items. Used in the FAQ component to render the correct icon.
 * This keeps the data file serializable while still supporting Lucide icons.
 */
export const FAQ_ICON_MAP = {
  CheckSquare,
  Box,
  ArrowLeftRight,
  ClipboardList,
  Star,
  AlertCircle,
  Truck,
  Tag,
  User,
  HelpCircle,
};
