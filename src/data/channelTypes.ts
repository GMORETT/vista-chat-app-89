import { ChannelType } from '../models/admin';

export const CHANNEL_TYPES: ChannelType[] = [
  {
    id: 'web_widget',
    name: 'Website',
    description: 'Add a chat widget to your website',
    icon: 'globe',
    fields: [
      {
        name: 'website_name',
        label: 'Website Name',
        type: 'text',
        required: true,
        placeholder: 'Your Website Name'
      },
      {
        name: 'website_url',
        label: 'Website URL',
        type: 'text',
        required: true,
        placeholder: 'https://your-website.com'
      }
    ]
  },
  {
    id: 'api',
    name: 'API',
    description: 'Connect using our API',
    icon: 'code',
    fields: [
      {
        name: 'webhook_url',
        label: 'Webhook URL',
        type: 'text',
        required: false,
        placeholder: 'https://your-app.com/webhook'
      }
    ]
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Support via email',
    icon: 'mail',
    fields: [
      {
        name: 'email',
        label: 'Email Address',
        type: 'text',
        required: true,
        placeholder: 'support@your-company.com'
      },
      {
        name: 'imap_enabled',
        label: 'Enable IMAP',
        type: 'boolean',
        required: false
      }
    ]
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Facebook Messenger integration',
    icon: 'facebook',
    fields: [
      {
        name: 'page_id',
        label: 'Facebook Page ID',
        type: 'text',
        required: true,
        placeholder: 'Your Facebook Page ID'
      },
      {
        name: 'page_access_token',
        label: 'Page Access Token',
        type: 'password',
        required: true,
        sensitive: true,
        placeholder: 'Your Page Access Token'
      }
    ]
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Instagram Direct Messages',
    icon: 'instagram',
    fields: [
      {
        name: 'business_account_id',
        label: 'Instagram Business Account ID',
        type: 'text',
        required: true,
        placeholder: 'Your Instagram Business Account ID'
      },
      {
        name: 'page_access_token',
        label: 'Page Access Token',
        type: 'password',
        required: true,
        sensitive: true,
        placeholder: 'Your Page Access Token'
      }
    ]
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Official WhatsApp Business API (Meta Cloud)',
    icon: 'message-circle',
    fields: [
      {
        name: 'phone_number',
        label: 'Phone Number',
        type: 'text',
        required: true,
        placeholder: '+1234567890',
        description: 'Phone number in international format'
      },
      {
        name: 'business_account_id',
        label: 'WhatsApp Business Account ID',
        type: 'text',
        required: true,
        placeholder: 'Your WhatsApp Business Account ID'
      },
      {
        name: 'api_key',
        label: 'API Key',
        type: 'password',
        required: true,
        sensitive: true,
        placeholder: 'Your WhatsApp API Key'
      },
      {
        name: 'webhook_verify_token',
        label: 'Webhook Verify Token',
        type: 'password',
        required: true,
        sensitive: true,
        placeholder: 'Random string for webhook verification'
      }
    ]
  },
  {
    id: 'twilio',
    name: 'Twilio SMS',
    description: 'SMS support via Twilio',
    icon: 'message-square',
    fields: [
      {
        name: 'phone_number',
        label: 'Twilio Phone Number',
        type: 'text',
        required: true,
        placeholder: '+1234567890'
      },
      {
        name: 'account_sid',
        label: 'Account SID',
        type: 'text',
        required: true,
        placeholder: 'Your Twilio Account SID'
      },
      {
        name: 'auth_token',
        label: 'Auth Token',
        type: 'password',
        required: true,
        sensitive: true,
        placeholder: 'Your Twilio Auth Token'
      }
    ]
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Telegram Bot integration',
    icon: 'send',
    fields: [
      {
        name: 'bot_token',
        label: 'Bot Token',
        type: 'password',
        required: true,
        sensitive: true,
        placeholder: 'Your Telegram Bot Token'
      }
    ]
  },
  {
    id: 'line',
    name: 'LINE',
    description: 'LINE Messaging API',
    icon: 'message-circle',
    fields: [
      {
        name: 'line_channel_id',
        label: 'LINE Channel ID',
        type: 'text',
        required: true,
        placeholder: 'Your LINE Channel ID'
      },
      {
        name: 'line_channel_secret',
        label: 'LINE Channel Secret',
        type: 'password',
        required: true,
        sensitive: true,
        placeholder: 'Your LINE Channel Secret'
      },
      {
        name: 'line_channel_token',
        label: 'LINE Channel Token',
        type: 'password',
        required: true,
        sensitive: true,
        placeholder: 'Your LINE Channel Token'
      }
    ]
  },
  {
    id: 'sms',
    name: 'SMS',
    description: 'Generic SMS integration',
    icon: 'smartphone',
    fields: [
      {
        name: 'phone_number',
        label: 'Phone Number',
        type: 'text',
        required: true,
        placeholder: '+1234567890'
      }
    ]
  }
];