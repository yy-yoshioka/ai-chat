yusukeyoshioka@Mac app % tree
.
├── _components
│   ├── common
│   │   ├── Breadcrumb.tsx
│   │   └── PageHeader.tsx
│   ├── feature
│   │   ├── admin
│   │   ├── auth
│   │   │   ├── LoginForm.tsx
│   │   │   ├── LoginFormActions.tsx
│   │   │   ├── LoginFormFields.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── billing
│   │   │   ├── admin-billing
│   │   │   │   ├── BillingPlans.tsx
│   │   │   │   ├── kpi-cards
│   │   │   │   │   ├── RevenueKpiCard.tsx
│   │   │   │   │   └── SubscriptionsKpiCard.tsx
│   │   │   │   ├── KpiErrorState.tsx
│   │   │   │   ├── KpiGrid.tsx
│   │   │   │   ├── KpiHeader.tsx
│   │   │   │   ├── KpiInsights.tsx
│   │   │   │   ├── KpiLoadingState.tsx
│   │   │   │   ├── PlanCard.tsx
│   │   │   │   ├── screen
│   │   │   │   │   ├── KpiDashboard.tsx
│   │   │   │   │   ├── ScreenMessage.tsx
│   │   │   │   │   └── TabBar.tsx
│   │   │   │   ├── tab-plans
│   │   │   │   │   ├── CurrentBadge.tsx
│   │   │   │   │   ├── PlanCard.tsx
│   │   │   │   │   ├── PlanGrid.tsx
│   │   │   │   │   ├── PlanTab.tsx
│   │   │   │   │   └── StatusPill.tsx
│   │   │   │   ├── tab-usage
│   │   │   │   │   ├── InvoiceTab.tsx
│   │   │   │   │   └── UsageTab.tsx
│   │   │   │   └── TrialStatusBanner.tsx
│   │   │   ├── PlansTab
│   │   │   │   ├── index.tsx
│   │   │   │   └── PlanCard.tsx
│   │   │   ├── StatsOverview.tsx
│   │   │   ├── success
│   │   │   │   ├── ErrorState.tsx
│   │   │   │   ├── LoadingState.tsx
│   │   │   │   ├── NextSteps.tsx
│   │   │   │   ├── PlanDetails.tsx
│   │   │   │   └── SuccessHeader.tsx
│   │   │   ├── TabNavigation.tsx
│   │   │   ├── TrialAlert.tsx
│   │   │   └── UsageTab
│   │   │       ├── index.tsx
│   │   │       ├── OverageSection.tsx
│   │   │       └── UsageItem.tsx
│   │   ├── chat
│   │   │   ├── admin
│   │   │   │   ├── AdminChatsView.tsx
│   │   │   │   ├── ChatFilters.tsx
│   │   │   │   ├── ChatSessionsTable.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── MetricsCards.tsx
│   │   │   │   ├── SatisfactionStars.tsx
│   │   │   │   ├── StatusBadge.tsx
│   │   │   │   └── TopTopics.tsx
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── ChatHeader.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── EmptyStateChat.tsx
│   │   │   └── LoadingMessage.tsx
│   │   ├── dashboard
│   │   │   ├── ActivityWidget.tsx
│   │   │   ├── AddWidgetModal.tsx
│   │   │   ├── ChartView.tsx
│   │   │   ├── ChartWidget.tsx
│   │   │   ├── DashboardView.tsx
│   │   │   ├── HealthWidget.tsx
│   │   │   ├── index.ts
│   │   │   ├── ReportTable.tsx
│   │   │   └── StatWidget.tsx
│   │   ├── faq
│   │   │   ├── edit
│   │   │   │   └── FaqForm.tsx
│   │   │   ├── FAQFilter.tsx
│   │   │   ├── FAQForm.tsx
│   │   │   ├── FAQItem.tsx
│   │   │   ├── FAQList.tsx
│   │   │   ├── FAQStatusBadge.tsx
│   │   │   └── FAQView.tsx
│   │   ├── legal
│   │   ├── logs
│   │   │   ├── LogFilters.tsx
│   │   │   ├── LogLevelBadge.tsx
│   │   │   ├── LogsView.tsx
│   │   │   └── LogTable.tsx
│   │   ├── marketing
│   │   ├── privacy
│   │   │   ├── ContactSection.tsx
│   │   │   ├── DataCollectionSection.tsx
│   │   │   ├── DataRetentionSection.tsx
│   │   │   ├── DataUsageSection.tsx
│   │   │   └── GdprRightsSection.tsx
│   │   ├── profile
│   │   │   ├── {hero,cards,shared,hooks}
│   │   │   ├── cards
│   │   │   │   ├── AccountInfoCard.tsx
│   │   │   │   ├── AccountSettingsCard.tsx
│   │   │   │   └── QuickActionsCard.tsx
│   │   │   ├── hero
│   │   │   │   ├── ProfileAvatar.tsx
│   │   │   │   ├── ProfileHero.tsx
│   │   │   │   └── RoleBadge.tsx
│   │   │   └── shared
│   │   │       ├── ActivitySummaryGrid.tsx
│   │   │       ├── ProfileErrorState.tsx
│   │   │       ├── ProfileInfoField.tsx
│   │   │       └── ProfileLoadingState.tsx
│   │   ├── reports
│   │   │   ├── DailyChatsChart.tsx
│   │   │   ├── ExportSection.tsx
│   │   │   ├── ReportSummaryCard.tsx
│   │   │   ├── ReportsView.tsx
│   │   │   └── SatisfactionChart.tsx
│   │   ├── settings
│   │   │   ├── APISettings.tsx
│   │   │   ├── BrandingSettings.tsx
│   │   │   ├── index.ts
│   │   │   ├── MembersSettings.tsx
│   │   │   ├── NotificationSettings.tsx
│   │   │   ├── SecuritySettings.tsx
│   │   │   ├── SettingsView.tsx
│   │   │   └── WidgetsSettings.tsx
│   │   ├── status
│   │   │   ├── IncidentCard.tsx
│   │   │   ├── StatusCard.tsx
│   │   │   └── UptimeStat.tsx
│   │   ├── superadmin
│   │   │   ├── layout
│   │   │   │   ├── LoadingScreen.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── TopHeader.tsx
│   │   │   │   └── UnauthorizedAccess.tsx
│   │   │   └── metrics
│   │   │       ├── MetricCard.tsx
│   │   │       ├── SystemActivity.tsx
│   │   │       └── SystemStatusOverview.tsx
│   │   ├── users
│   │   │   ├── UserBadge.tsx
│   │   │   ├── UsersView.tsx
│   │   │   └── UserTable.tsx
│   │   ├── widget
│   │   │   └── DynamicWidgetLoader.tsx
│   │   └── widgets
│   │       ├── CompanySelector.tsx
│   │       ├── create
│   │       │   ├── AdvancedSettings.tsx
│   │       │   ├── BasicSettings.tsx
│   │       │   ├── CreateWidgetView.tsx
│   │       │   ├── EmbedCode.tsx
│   │       │   ├── index.ts
│   │       │   ├── ThemeSettings.tsx
│   │       │   └── WidgetPreview.tsx
│   │       ├── CreateWidgetForm.tsx
│   │       ├── WidgetCard.tsx
│   │       ├── WidgetsEmptyState.tsx
│   │       ├── WidgetsGrid.tsx
│   │       ├── WidgetsLoading.tsx
│   │       └── WidgetsPageHeader.tsx
│   ├── guard
│   │   ├── AdminAuthGuard.tsx
│   │   ├── AuthGuard.tsx
│   │   ├── OrgAdminGuard.tsx
│   │   ├── PermissionGate.tsx
│   │   └── withAuth.tsx
│   ├── layout
│   │   ├── AdminHeader.tsx
│   │   ├── AdminLayout.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── AdminTrialBadge.tsx
│   │   ├── Layout.tsx
│   │   └── Navigation.tsx
│   ├── provider
│   │   └── Providers.tsx
│   └── ui
│       ├── badge
│       │   ├── StatusPill.tsx
│       │   └── TrialBadge.tsx
│       ├── billing
│       │   └── KPICard.tsx
│       ├── gate
│       ├── Input.tsx
│       └── nav
│           ├── NavItem.tsx
│           └── OrgSwitcher.tsx
├── _config
│   ├── admin
│   │   └── navigation.ts
│   ├── api.ts
│   ├── auth
│   │   └── constants.ts
│   ├── billing
│   │   ├── constants.ts
│   │   ├── index.ts
│   │   ├── plans.ts
│   │   ├── trial.ts
│   │   ├── ui.ts
│   │   └── utils.ts
│   ├── faq
│   │   └── constants.ts
│   ├── index.ts
│   ├── legal
│   ├── logs
│   │   └── constants.ts
│   ├── marketing
│   ├── navigation
│   │   ├── admin
│   │   │   ├── index.ts
│   │   │   ├── meta.ts
│   │   │   └── sidebar.ts
│   │   └── public
│   │       └── sidebar.ts
│   ├── profile
│   │   ├── constants.ts
│   │   └── icons.tsx
│   ├── reports
│   │   └── constants.ts
│   ├── settings
│   │   └── tabs.ts
│   ├── status
│   │   ├── colors.ts
│   │   └── mock.ts
│   ├── users
│   │   └── constants.ts
│   └── widgets
│       ├── constants.ts
│       └── create.ts
├── _domains
│   ├── admin
│   ├── auth
│   │   ├── index.ts
│   │   ├── membership.ts
│   │   ├── permission.ts
│   │   ├── role.ts
│   │   └── user.ts
│   └── billing
│       ├── checkout-session.ts
│       ├── checkout.ts
│       ├── index.ts
│       ├── kpi.ts
│       ├── plan.ts
│       ├── settings.ts
│       ├── subscription.ts
│       ├── usage.ts
│       └── webhook.ts
├── _emails
│   ├── components.ts
│   ├── index.ts
│   ├── replaceVars.ts
│   ├── styles.ts
│   ├── templates
│   │   ├── index.ts
│   │   └── welcome.ts
│   └── urls.ts
├── _fixtures
│   ├── billing.fixtures.ts
│   ├── profile.fixtures.ts
│   └── widgets.fixtures.ts
├── _hooks
│   ├── admin
│   │   └── faq
│   │       ├── useCreateFaq.ts
│   │       └── useEditFaq.ts
│   ├── auth
│   │   ├── useAuth.new.ts
│   │   ├── useAuth.ts
│   │   ├── useAuthQuery.ts
│   │   ├── useCurrentOrg.ts
│   │   ├── useLoginForm.ts
│   │   └── useSignupForm.ts
│   ├── billing
│   │   ├── useBilling.ts
│   │   ├── useBillingKpi.ts
│   │   ├── useCheckout.ts
│   │   ├── useCheckoutSession.ts
│   │   ├── useInvoices.ts
│   │   └── useKpiDashboard.ts
│   ├── chat
│   │   ├── useAdminChats.ts
│   │   ├── useChat.ts
│   │   └── useChatMessages.ts
│   ├── dashboard
│   │   └── useDashboard.ts
│   ├── faq
│   │   └── useFAQ.ts
│   ├── logs
│   │   └── useLogs.ts
│   ├── marketing
│   ├── navigation
│   │   └── usePublicMenu.ts
│   ├── org
│   │   └── useOrganizations.ts
│   ├── profile
│   │   └── useProfileData.ts
│   ├── reports
│   │   └── useReports.ts
│   ├── settings
│   │   └── useSettings.ts
│   ├── status
│   │   └── useStatus.ts
│   ├── superadmin
│   │   ├── useSuperAdminAuth.ts
│   │   └── useSystemMetrics.ts
│   ├── users
│   │   └── useUsers.ts
│   └── widgets
│       ├── create
│       │   └── useCreateWidget.ts
│       ├── useCompanies.ts
│       ├── useWidgetActions.ts
│       ├── useWidgets.ts
│       └── useWidgetsPage.ts
├── _mocks
│   └── organization.ts
├── _providers
│   └── query-provider.tsx
├── _schemas
│   ├── auth.ts
│   ├── billing.ts
│   ├── chat.ts
│   ├── dashboard.ts
│   ├── faq.ts
│   ├── index.ts
│   ├── logs.ts
│   ├── profile.ts
│   ├── reports.ts
│   ├── settings.ts
│   ├── trial.ts
│   ├── users.ts
│   └── widget.ts
├── _utils
│   ├── auth
│   │   ├── redirect.ts
│   │   └── validation.ts
│   ├── auth-utils.ts
│   ├── billing
│   │   ├── price-utils.ts
│   │   ├── trial-utils.ts
│   │   └── usage-utils.ts
│   ├── chat
│   │   └── format.ts
│   ├── fetcher.ts
│   ├── formatters.ts
│   ├── navigation
│   │   └── nav-helpers.ts
│   └── status
│       └── format.ts
├── (auth)
│   ├── layout.tsx
│   ├── login
│   │   └── page.tsx
│   ├── logout
│   │   └── page.tsx
│   ├── signup
│   │   └── page.tsx
│   ├── step-install.tsx
│   ├── step-plan
│   │   ├── PlanCard.tsx
│   │   └── usePlanCheckout.ts
│   └── step-plan.tsx
├── (marketing)
│   ├── _components
│   │   ├── BetaInviteSection.tsx
│   │   ├── CompetitiveAdvantagesSection
│   │   │   ├── ComparisonTable.tsx
│   │   │   ├── data.tsx
│   │   │   └── FeatureCard.tsx
│   │   ├── CompetitiveAdvantagesSection.tsx
│   │   ├── CustomerSuccessSection.tsx
│   │   ├── HeroSection.tsx
│   │   └── ROICalculatorSection.tsx
│   ├── blog
│   │   ├── [slug]
│   │   │   ├── _components
│   │   │   │   ├── ArticleHeader.tsx
│   │   │   │   ├── Breadcrumb.tsx
│   │   │   │   ├── CallToAction.tsx
│   │   │   │   ├── RelatedPosts.tsx
│   │   │   │   ├── ShareButton.tsx
│   │   │   │   └── ShareSection.tsx
│   │   │   ├── data.ts
│   │   │   ├── page.tsx
│   │   │   └── types.ts
│   │   ├── components
│   │   │   ├── BlogCTA.tsx
│   │   │   ├── BlogHeader.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── FeaturedPostCard.tsx
│   │   │   ├── PostCard.tsx
│   │   │   └── TagFilter.tsx
│   │   └── index.tsx
│   ├── faq
│   │   └── index.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   ├── privacy
│   │   └── page.tsx
│   └── status
│       └── page.tsx
├── (org)
│   └── admin
│       └── [orgId]
│           ├── billing
│           │   ├── BillingPageClient.tsx
│           │   └── page.tsx
│           ├── billing-plans
│           │   ├── page.tsx
│           │   └── page.tsx.backup
│           ├── chats
│           │   └── page.tsx
│           ├── dashboard
│           │   └── page.tsx
│           ├── faq
│           │   ├── [id]
│           │   │   └── page.tsx
│           │   ├── create
│           │   │   └── page.tsx
│           │   └── page.tsx
│           ├── layout.tsx
│           ├── logs
│           │   └── page.tsx
│           ├── reports
│           │   └── page.tsx
│           ├── settings
│           │   ├── page.tsx
│           │   └── widgets
│           │       ├── page.tsx
│           │       └── page.tsx.backup
│           ├── users
│           │   └── page.tsx
│           └── widgets
│               ├── create
│               │   └── page.tsx
│               └── page.tsx
├── (super)
│   └── superadmin
│       ├── incidents
│       │   ├── _components
│       │   │   ├── badges.tsx
│       │   │   ├── IncidentsTable.tsx
│       │   │   ├── IncidentStats.tsx
│       │   │   ├── RecentUpdates.tsx
│       │   │   └── utils.ts
│       │   ├── data.ts
│       │   ├── page.tsx
│       │   └── types.ts
│       ├── layout.tsx
│       ├── metrics
│       │   └── page.tsx
│       └── tenants
│           ├── _components
│           │   ├── badges.tsx
│           │   ├── TenantsTable.tsx
│           │   └── TenantStats.tsx
│           ├── data.ts
│           ├── page.tsx
│           └── types.ts
├── (user)
│   ├── billing
│   │   ├── cancel
│   │   ├── success
│   │   └── success.tsx
│   ├── layout.tsx
│   └── profile
│       ├── page.tsx
│       └── page.tsx.backup
├── admin
│   └── org-selector
│       └── page.tsx
├── api
│   ├── beta-invite
│   │   └── route.ts
│   ├── bff
│   │   ├── auth
│   │   │   ├── login
│   │   │   │   └── route.ts
│   │   │   ├── logout
│   │   │   │   └── route.ts
│   │   │   ├── me
│   │   │   │   └── route.ts
│   │   │   └── signup
│   │   │       └── route.ts
│   │   ├── billing
│   │   │   └── route.ts
│   │   ├── chat
│   │   │   └── route.ts
│   │   └── faq
│   │       ├── [id]
│   │       │   └── route.ts
│   │       └── route.ts
│   ├── billing
│   │   ├── checkout
│   │   │   └── route.ts
│   │   ├── plans
│   │   │   └── route.ts
│   │   ├── usage
│   │   │   └── route.ts
│   │   └── webhook
│   │       └── route.ts
│   ├── chat
│   │   └── widget
│   │       └── [widgetKey]
│   │           └── route.ts
│   ├── companies
│   │   └── route.ts
│   ├── login
│   │   └── route.ts
│   ├── logout
│   │   └── route.ts
│   ├── me
│   │   └── route.ts
│   ├── signup
│   │   └── route.ts
│   ├── status
│   │   └── rss
│   │       └── route.ts
│   ├── trial
│   │   └── extend
│   │       └── route.ts
│   └── widgets
│       ├── [widgetKey]
│       │   └── route.ts
│       └── route.ts
├── jobs
│   ├── email-drip.ts
│   └── usage-record.ts
├── layout.tsx
└── tests
    └── email-drip.ts

179 directories, 359 files