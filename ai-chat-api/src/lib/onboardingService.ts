import {
  getWelcomeEmailTemplate,
  getUsageGuideEmailTemplate,
  getSuccessStoriesEmailTemplate,
  type OnboardingData,
  type EmailTemplate,
} from './emailTemplates';

interface OnboardingSchedule {
  userId: string;
  email: string;
  firstName: string;
  company: string;
  signupDate: Date;
  emailsSent: {
    welcome: boolean;
    guide: boolean;
    success: boolean;
  };
}

class OnboardingService {
  private schedules: Map<string, OnboardingSchedule> = new Map();

  async createOnboardingSchedule(userData: {
    userId: string;
    email: string;
    firstName: string;
    company: string;
  }): Promise<void> {
    const schedule: OnboardingSchedule = {
      ...userData,
      signupDate: new Date(),
      emailsSent: {
        welcome: false,
        guide: false,
        success: false,
      },
    };

    this.schedules.set(userData.userId, schedule);
    await this.sendWelcomeEmail(userData.userId);

    setTimeout(
      () => {
        this.sendUsageGuideEmail(userData.userId);
      },
      3 * 24 * 60 * 60 * 1000
    );

    setTimeout(
      () => {
        this.sendSuccessStoriesEmail(userData.userId);
      },
      7 * 24 * 60 * 60 * 1000
    );

    console.log(`Onboarding schedule created for user ${userData.userId}`);
  }

  private async sendWelcomeEmail(userId: string): Promise<void> {
    const schedule = this.schedules.get(userId);
    if (!schedule || schedule.emailsSent.welcome) return;

    const onboardingData: OnboardingData = {
      firstName: schedule.firstName,
      company: schedule.company,
      email: schedule.email,
      setupUrl: `${process.env.NEXT_PUBLIC_UI_URL}/widgets/setup`,
      dashboardUrl: `${process.env.NEXT_PUBLIC_UI_URL}/admin`,
      supportUrl: `${process.env.NEXT_PUBLIC_UI_URL}/faq`,
    };

    const emailTemplate = getWelcomeEmailTemplate(onboardingData);

    try {
      await this.sendEmail(schedule.email, emailTemplate);
      schedule.emailsSent.welcome = true;
      await this.trackEmailEvent(userId, 'welcome_email_sent');
      console.log(`Welcome email sent to ${schedule.email}`);
    } catch (error) {
      console.error(
        `Failed to send welcome email to ${schedule.email}:`,
        error
      );
    }
  }

  private async sendUsageGuideEmail(userId: string): Promise<void> {
    const schedule = this.schedules.get(userId);
    if (!schedule || schedule.emailsSent.guide) return;

    const onboardingData: OnboardingData = {
      firstName: schedule.firstName,
      company: schedule.company,
      email: schedule.email,
      setupUrl: `${process.env.NEXT_PUBLIC_UI_URL}/widgets/setup`,
      dashboardUrl: `${process.env.NEXT_PUBLIC_UI_URL}/admin`,
      supportUrl: `${process.env.NEXT_PUBLIC_UI_URL}/faq`,
    };

    const emailTemplate = getUsageGuideEmailTemplate(onboardingData);

    try {
      await this.sendEmail(schedule.email, emailTemplate);
      schedule.emailsSent.guide = true;
      await this.trackEmailEvent(userId, 'guide_email_sent');
      console.log(`Usage guide email sent to ${schedule.email}`);
    } catch (error) {
      console.error(
        `Failed to send usage guide email to ${schedule.email}:`,
        error
      );
    }
  }

  private async sendSuccessStoriesEmail(userId: string): Promise<void> {
    const schedule = this.schedules.get(userId);
    if (!schedule || schedule.emailsSent.success) return;

    const onboardingData: OnboardingData = {
      firstName: schedule.firstName,
      company: schedule.company,
      email: schedule.email,
      setupUrl: `${process.env.NEXT_PUBLIC_UI_URL}/widgets/setup`,
      dashboardUrl: `${process.env.NEXT_PUBLIC_UI_URL}/admin`,
      supportUrl: `${process.env.NEXT_PUBLIC_UI_URL}/faq`,
    };

    const emailTemplate = getSuccessStoriesEmailTemplate(onboardingData);

    try {
      await this.sendEmail(schedule.email, emailTemplate);
      schedule.emailsSent.success = true;
      await this.trackEmailEvent(userId, 'success_email_sent');
      console.log(`Success stories email sent to ${schedule.email}`);
    } catch (error) {
      console.error(
        `Failed to send success stories email to ${schedule.email}:`,
        error
      );
    }
  }

  private async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      console.log('=== EMAIL PREVIEW ===');
      console.log(`To: ${to}`);
      console.log(`Subject: ${template.subject}`);
      console.log(`Text: ${template.text.substring(0, 200)}...`);
      console.log('===================');
      return;
    }
  }

  private async trackEmailEvent(
    userId: string,
    eventType: string
  ): Promise<void> {
    try {
      const eventData = {
        userId,
        eventType,
        timestamp: new Date().toISOString(),
        source: 'onboarding_emails',
      };
      console.log('Email event tracked:', eventData);
    } catch (error) {
      console.error('Failed to track email event:', error);
    }
  }

  getOnboardingStatus(userId: string): OnboardingSchedule | null {
    return this.schedules.get(userId) || null;
  }

  async resendEmail(
    userId: string,
    emailType: 'welcome' | 'guide' | 'success'
  ): Promise<void> {
    const schedule = this.schedules.get(userId);
    if (!schedule) {
      throw new Error('User not found in onboarding schedule');
    }

    switch (emailType) {
      case 'welcome':
        schedule.emailsSent.welcome = false;
        await this.sendWelcomeEmail(userId);
        break;
      case 'guide':
        schedule.emailsSent.guide = false;
        await this.sendUsageGuideEmail(userId);
        break;
      case 'success':
        schedule.emailsSent.success = false;
        await this.sendSuccessStoriesEmail(userId);
        break;
      default:
        throw new Error('Invalid email type');
    }
  }
}

export const onboardingService = new OnboardingService();

export async function initializeUserOnboarding(userData: {
  userId: string;
  email: string;
  firstName: string;
  company: string;
}): Promise<void> {
  await onboardingService.createOnboardingSchedule(userData);
}

export function getUserOnboardingStatus(userId: string) {
  return onboardingService.getOnboardingStatus(userId);
}
