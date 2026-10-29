{
    "name": "Vorevia Website",
    "version": "19.0.3.1.0",
    "category": "Website",
    "summary": "Custom website for Vorevia Technologies",
    "author": "Vorevia Technologies",
    "depends": ["website", "website_blog"],
    "data": [
        "security/ir.model.access.csv",
        "data/website_form_data.xml",
        "views/consultation_views.xml",
        "views/homepage.xml",
    ],
    "assets": {
        "web.assets_frontend": [
            "website_vorevia/static/src/scss/theme.scss",
            "website_vorevia/static/src/scss/hero_refinement.scss",
            "website_vorevia/static/src/js/homepage.js",
        ],
    },
    "installable": True,
    "application": True,
    "license": "LGPL-3",
}
