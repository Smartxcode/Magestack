import { SourceId } from "../types.js";

export interface TopicToolDefinition {
  name: string;
  title: string;
  description: string;
  source: SourceId;
  query: string;
}

const hyvaTopics: TopicToolDefinition[] = [
  {
    name: "hyva_installation_overview",
    title: "Hyvä installation overview",
    description: "Return supported platforms, Magento/MageOS versions and prerequisites for Hyvä.",
    source: "hyva",
    query: "Hyva installation overview requirements"
  },
  {
    name: "hyva_installation_steps_clean_magento",
    title: "Hyvä installation on clean Magento/MageOS",
    description: "Step-by-step Hyvä setup on a clean Magento/MageOS instance including composer commands.",
    source: "hyva",
    query: "Install Hyva on clean Magento MageOS step by step"
  },
  {
    name: "hyva_license_and_download",
    title: "Hyvä license and download",
    description: "Explain license terms, portal access and how to download Hyvä packages.",
    source: "hyva",
    query: "Hyva license download access token"
  },
  {
    name: "hyva_required_dependencies",
    title: "Hyvä required dependencies",
    description: "List PHP/Node/composer dependencies, Magento modules and tooling required by Hyvä.",
    source: "hyva",
    query: "Hyva required dependencies php composer node"
  },
  {
    name: "hyva_theme_activation_and_configuration",
    title: "Hyvä theme activation",
    description: "Describe how to activate Hyvä as the storefront theme via admin and configuration files.",
    source: "hyva",
    query: "Hyva activate theme configure default"
  },
  {
    name: "hyva_build_frontend_assets",
    title: "Hyvä frontend build",
    description: "Show commands for building Hyvä assets (npm/yarn build, dev, watch).",
    source: "hyva",
    query: "Hyva build frontend assets npm yarn"
  },
  {
    name: "hyva_tailwind_configuration",
    title: "Hyvä Tailwind configuration",
    description: "Explain Tailwind config, purge settings, safelist and extending utilities in Hyvä.",
    source: "hyva",
    query: "Hyva Tailwind config purge safelist"
  },
  {
    name: "hyva_templates_structure",
    title: "Hyvä templates structure",
    description: "Outline PHTML/layout structure, overrides and template organization in Hyvä.",
    source: "hyva",
    query: "Hyva templates structure layout override"
  },
  {
    name: "hyva_components_library_overview",
    title: "Hyvä component library",
    description: "Provide overview of built-in Hyvä components such as cart, menu and forms.",
    source: "hyva",
    query: "Hyva component library overview"
  },
  {
    name: "hyva_add_custom_component",
    title: "Add custom Hyvä component",
    description: "Describe how to create/register custom Hyvä components with Alpine/Tailwind.",
    source: "hyva",
    query: "Hyva create custom component"
  },
  {
    name: "hyva_javascript_stack",
    title: "Hyvä JavaScript stack",
    description: "Explain Alpine.js usage, JS patterns and avoiding heavy frameworks in Hyvä.",
    source: "hyva",
    query: "Hyva JavaScript stack Alpine"
  },
  {
    name: "hyva_styling_best_practices",
    title: "Hyvä styling best practices",
    description: "Guidelines for Tailwind styling, responsive patterns and utility usage in Hyvä.",
    source: "hyva",
    query: "Hyva styling best practices Tailwind"
  },
  {
    name: "hyva_checkout_customization",
    title: "Hyvä checkout customization",
    description: "Detail customization hooks and files for modifying Hyvä checkout.",
    source: "hyva",
    query: "Hyva checkout customization guide"
  },
  {
    name: "hyva_performance_optimization",
    title: "Hyvä performance",
    description: "Provide performance recommendations: critical CSS, lazy loading, caching.",
    source: "hyva",
    query: "Hyva performance optimization"
  },
  {
    name: "hyva_modules_compatibility_matrix",
    title: "Hyvä module compatibility",
    description: "Outline compatibility matrix and integration notes for popular Magento modules.",
    source: "hyva",
    query: "Hyva modules compatibility matrix"
  },
  {
    name: "hyva_translation_and_locale_handling",
    title: "Hyvä translations",
    description: "Explain translation files, i18n workflow and multi-locale handling in Hyvä.",
    source: "hyva",
    query: "Hyva translation locale handling"
  },
  {
    name: "hyva_debugging_and_troubleshooting",
    title: "Hyvä troubleshooting",
    description: "List common Hyvä issues and debugging steps (missing styles, JS errors).",
    source: "hyva",
    query: "Hyva debugging troubleshooting"
  },
  {
    name: "hyva_upgrade_guide",
    title: "Hyvä upgrade guide",
    description: "Describe process for upgrading Hyvä, reviewing changelog and merging configs.",
    source: "hyva",
    query: "Hyva upgrade guide"
  },
  {
    name: "hyva_third_party_integration_patterns",
    title: "Hyvä third-party integrations",
    description: "Show integration patterns for analytics, tracking and external widgets in Hyvä.",
    source: "hyva",
    query: "Hyva third party integration pattern"
  },
  {
    name: "hyva_full_stack_example_setup",
    title: "Hyvä full stack example",
    description: "Provide full-stack reference setup (MageOS + Hyvä + caching stack).",
    source: "hyva",
    query: "Hyva full stack example setup"
  }
];

const mageosTopics: TopicToolDefinition[] = [
  {
    name: "mageos_installation_requirements",
    title: "MageOS installation requirements",
    description: "System requirements for MageOS (PHP, DB, Elasticsearch/OpenSearch).",
    source: "mageos",
    query: "MageOS installation requirements"
  },
  {
    name: "mageos_fresh_installation_steps",
    title: "MageOS installation steps",
    description: "Detailed clean installation workflow for MageOS including composer commands.",
    source: "mageos",
    query: "MageOS fresh installation steps"
  },
  {
    name: "mageos_upgrade_and_patching",
    title: "MageOS upgrades and patches",
    description: "Procedures for upgrading MageOS and applying security patches.",
    source: "mageos",
    query: "MageOS upgrade patching"
  },
  {
    name: "mageos_module_development_basics",
    title: "MageOS module basics",
    description: "Explain module folder structure, registration.php, module.xml, di.xml.",
    source: "mageos",
    query: "MageOS module development basics"
  },
  {
    name: "mageos_theme_development_basics",
    title: "MageOS theme basics",
    description: "Guide to creating themes (inheritance, Hyvä/Satoshi integration hooks).",
    source: "mageos",
    query: "MageOS theme development basics"
  },
  {
    name: "mageos_dependency_management_composer",
    title: "MageOS composer management",
    description: "Managing composer dependencies, private repos and autoload settings for MageOS.",
    source: "mageos",
    query: "MageOS composer dependency management"
  },
  {
    name: "mageos_frontend_stack_overview",
    title: "MageOS frontend stack",
    description: "Describe layout XML, PHTML, RequireJS and legacy frontend pipeline.",
    source: "mageos",
    query: "MageOS frontend stack overview"
  },
  {
    name: "mageos_backend_configuration_important_sections",
    title: "MageOS backend configuration",
    description: "Highlight must-know admin sections (cache, indexers, store config, cron).",
    source: "mageos",
    query: "MageOS backend configuration important sections"
  },
  {
    name: "mageos_cron_and_indexers_setup",
    title: "MageOS cron and indexers",
    description: "Explain CRON/indexer setup and key bin/magento commands.",
    source: "mageos",
    query: "MageOS cron indexers setup"
  },
  {
    name: "mageos_cache_layers_explained",
    title: "MageOS cache layers",
    description: "Document caching layers (Magento cache, FPC, Varnish, Redis).",
    source: "mageos",
    query: "MageOS cache layers explained"
  },
  {
    name: "mageos_api_rest_graphql_overview",
    title: "MageOS API overview",
    description: "Summaries for REST and GraphQL APIs, tokens and usage.",
    source: "mageos",
    query: "MageOS REST GraphQL overview"
  },
  {
    name: "mageos_configuration_scopes",
    title: "MageOS configuration scopes",
    description: "Explain global/website/store scopes and theme impact.",
    source: "mageos",
    query: "MageOS configuration scopes"
  },
  {
    name: "mageos_security_best_practices",
    title: "MageOS security best practices",
    description: "Hardening guidelines: file permissions, admin users, MFA, panel protection.",
    source: "mageos",
    query: "MageOS security best practices"
  },
  {
    name: "mageos_logging_and_debugging",
    title: "MageOS logging and debugging",
    description: "Location of logs, enabling developer mode, debugging practices.",
    source: "mageos",
    query: "MageOS logging debugging"
  },
  {
    name: "mageos_database_schema_and_migrations",
    title: "MageOS DB schema and migrations",
    description: "Describe db_schema.xml, data patches and schema patches.",
    source: "mageos",
    query: "MageOS database schema migrations"
  },
  {
    name: "mageos_cli_commands_reference",
    title: "MageOS CLI reference",
    description: "List essential bin/magento commands and scenarios.",
    source: "mageos",
    query: "MageOS CLI commands reference"
  },
  {
    name: "mageos_integration_with_varnish_and_redis",
    title: "MageOS with Varnish and Redis",
    description: "Showcase configuration of Varnish/Redis layers with MageOS.",
    source: "mageos",
    query: "MageOS integrate Varnish Redis"
  },
  {
    name: "mageos_performance_optimization",
    title: "MageOS performance",
    description: "Performance best practices: production mode, statics deploy, opcache.",
    source: "mageos",
    query: "MageOS performance optimization"
  },
  {
    name: "mageos_multistore_setup",
    title: "MageOS multistore setup",
    description: "Guide for multi-website/store creation with theme bindings.",
    source: "mageos",
    query: "MageOS multistore setup"
  },
  {
    name: "mageos_full_stack_deployment_pattern",
    title: "MageOS full stack deployment",
    description: "Describe CI/CD deployment pattern, caching and post-deploy tests.",
    source: "mageos",
    query: "MageOS full stack deployment pattern"
  }
];

const satoshiTopics: TopicToolDefinition[] = [
  {
    name: "satoshi_overview_and_use_cases",
    title: "Satoshi overview",
    description: "Overview of Satoshi Hyvä theme use cases and positioning.",
    source: "satoshi",
    query: "Satoshi Hyva overview use cases"
  },
  {
    name: "satoshi_installation_prerequisites",
    title: "Satoshi prerequisites",
    description: "List prerequisites: Hyvä availability, Magento versions, required modules.",
    source: "satoshi",
    query: "Satoshi Hyva installation prerequisites"
  },
  {
    name: "satoshi_installation_steps",
    title: "Satoshi installation steps",
    description: "Detailed Satoshi installation on Hyvä/MageOS.",
    source: "satoshi",
    query: "Install Satoshi Hyva steps"
  },
  {
    name: "satoshi_theme_structure",
    title: "Satoshi theme structure",
    description: "Explain directory layout, layouts, templates and assets in Satoshi.",
    source: "satoshi",
    query: "Satoshi theme structure"
  },
  {
    name: "satoshi_components_catalog",
    title: "Satoshi components catalog",
    description: "Catalogue hero/banner/grid components and file locations.",
    source: "satoshi",
    query: "Satoshi components catalog"
  },
  {
    name: "satoshi_styling_and_design_system",
    title: "Satoshi styling system",
    description: "Describe Tailwind utilities, design tokens and spacing/color rules in Satoshi.",
    source: "satoshi",
    query: "Satoshi styling design system"
  },
  {
    name: "satoshi_customization_guide",
    title: "Satoshi customization guide",
    description: "Explain overrides/child theme approach to extend Satoshi safely.",
    source: "satoshi",
    query: "Satoshi customization best practices"
  },
  {
    name: "satoshi_checkout_and_cart_customization",
    title: "Satoshi checkout/cart",
    description: "Customize cart and checkout flows delivered by Satoshi.",
    source: "satoshi",
    query: "Satoshi checkout cart customization"
  },
  {
    name: "satoshi_content_blocks_and_cms",
    title: "Satoshi CMS blocks",
    description: "Explain CMS/Page Builder integration and building landing pages in Satoshi.",
    source: "satoshi",
    query: "Satoshi content blocks cms"
  },
  {
    name: "satoshi_performance_considerations",
    title: "Satoshi performance",
    description: "Performance considerations when extending Satoshi.",
    source: "satoshi",
    query: "Satoshi performance considerations"
  },
  {
    name: "satoshi_dependencies_and_versioning",
    title: "Satoshi dependencies/versioning",
    description: "Explain dependencies (Hyvä version, packages) and versioning policy.",
    source: "satoshi",
    query: "Satoshi dependencies versioning"
  },
  {
    name: "satoshi_demo_layouts_and_presets",
    title: "Satoshi demo layouts",
    description: "List demo layouts/presets and how to import them.",
    source: "satoshi",
    query: "Satoshi demo layouts presets"
  },
  {
    name: "satoshi_navigation_and_header_patterns",
    title: "Satoshi navigation/header",
    description: "Explain mega-menu, mobile navigation and header patterns.",
    source: "satoshi",
    query: "Satoshi navigation header patterns"
  },
  {
    name: "satoshi_product_page_layouts",
    title: "Satoshi product pages",
    description: "Describe PDP layout, components and extension points.",
    source: "satoshi",
    query: "Satoshi product page layout"
  },
  {
    name: "satoshi_category_page_layouts",
    title: "Satoshi category pages",
    description: "Explain category listing layouts, filters and pagination.",
    source: "satoshi",
    query: "Satoshi category page layout"
  },
  {
    name: "satoshi_integration_with_marketing_tools",
    title: "Satoshi marketing integrations",
    description: "Patterns for integrating marketing/analytics/tag managers.",
    source: "satoshi",
    query: "Satoshi marketing integration"
  },
  {
    name: "satoshi_typical_customization_examples",
    title: "Satoshi customization examples",
    description: "Concrete examples like altering product cards or homepage sections.",
    source: "satoshi",
    query: "Satoshi customization examples"
  },
  {
    name: "satoshi_debugging_and_common_issues",
    title: "Satoshi troubleshooting",
    description: "Common Satoshi issues (style conflicts, JS errors) and diagnostics.",
    source: "satoshi",
    query: "Satoshi debugging issues"
  },
  {
    name: "satoshi_upgrade_path",
    title: "Satoshi upgrade path",
    description: "Guide to upgrading Satoshi versions safely and testing changes.",
    source: "satoshi",
    query: "Satoshi upgrade path"
  },
  {
    name: "satoshi_full_stack_example_setup",
    title: "Satoshi full stack example",
    description: "Describe MageOS + Hyvä + Satoshi deployment with caching/CDN layers.",
    source: "satoshi",
    query: "Satoshi full stack example setup"
  }
];

export const topicTools: TopicToolDefinition[] = [...hyvaTopics, ...mageosTopics, ...satoshiTopics];
