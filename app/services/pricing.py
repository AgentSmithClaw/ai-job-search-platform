from app.schemas import PricingCatalogResponse, PricingPackage


def get_pricing_catalog() -> PricingCatalogResponse:
    return PricingCatalogResponse(
        packages=[
            PricingPackage(
                code='gap-report',
                name='Gap Report',
                price_cny=29,
                credits=1,
                description='Submit your resume and a job description to receive a structured fit report, gap analysis, and next-step recommendations.',
                includes=['Match score overview', 'Gap breakdown', 'Learning actions', 'Interview focus points'],
            ),
            PricingPackage(
                code='resume-polish',
                name='Resume Polish',
                price_cny=49,
                credits=2,
                description='Build on the gap report with a tailored resume draft and concrete rewrite suggestions for the target role.',
                includes=['Tailored resume draft', 'Rewrite suggestions', 'Keyword coverage guidance'],
            ),
            PricingPackage(
                code='full-pack',
                name='Career Sprint Pack',
                price_cny=79,
                credits=4,
                description='A focused bundle for active applications, combining analysis, resume improvements, and interview preparation guidance.',
                includes=['Gap analysis', 'Tailored resume support', 'Learning roadmap', 'Interview prep guidance'],
            ),
        ]
    )


def get_package_by_code(package_code: str) -> PricingPackage | None:
    catalog = get_pricing_catalog()
    for package in catalog.packages:
        if package.code == package_code:
            return package
    return None
