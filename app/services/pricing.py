from app.schemas import PricingCatalogResponse, PricingPackage


def get_pricing_catalog() -> PricingCatalogResponse:
    return PricingCatalogResponse(
        packages=[
            PricingPackage(
                code='gap-report',
                name='差距分析',
                price_cny=29,
                credits=1,
                description='输入简历和 JD，返回岗位差距分析、风险和下一步动作。',
                includes=['匹配度评分', '缺口拆解', '学习建议', '面试重点'],
            ),
            PricingPackage(
                code='resume-polish',
                name='简历定制',
                price_cny=49,
                credits=2,
                description='在差距分析基础上生成岗位定制版简历草稿与优化建议。',
                includes=['定制简历草稿', '表达优化建议', '关键词覆盖建议'],
            ),
            PricingPackage(
                code='full-pack',
                name='求职冲刺包',
                price_cny=79,
                credits=4,
                description='适合准备投递前的集中优化，包含分析、简历和面试准备建议。',
                includes=['差距分析', '定制简历', '学习计划', '面试准备重点'],
            ),
        ]
    )


def get_package_by_code(package_code: str) -> PricingPackage | None:
    catalog = get_pricing_catalog()
    for package in catalog.packages:
        if package.code == package_code:
            return package
    return None
