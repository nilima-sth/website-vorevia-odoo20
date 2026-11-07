from odoo import http
from odoo.http import request


class VoreviaWebsite(http.Controller):
    """Code-owned public pages that must not fall back to builder copies."""

    @http.route(
        "/services",
        type="http",
        auth="public",
        website=True,
        sitemap=True,
        readonly=True,
    )
    def services(self, **kwargs):
        return request.render("website_vorevia.vorevia_services_page")
