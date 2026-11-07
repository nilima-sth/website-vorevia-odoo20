from werkzeug.exceptions import NotFound

from odoo import _, http
from odoo.http import request

from odoo.addons.portal.controllers.portal import CustomerPortal, pager as portal_pager


class VoreviaCustomerPortal(CustomerPortal):
    """Expose only the signed-in contact's consultation requests."""

    def _consultation_domain(self):
        return [("partner_id", "=", request.env.user.partner_id.id)]

    def _prepare_portal_counter_values(self, counter):
        if counter == "consultation_count":
            return "vorevia.consultation", self._consultation_domain(), "sudo"
        return super()._prepare_portal_counter_values(counter)

    @http.route()
    def home(self, **kwargs):
        """Render a branded overview with only the current user's records."""
        consultations = request.env["vorevia.consultation"].sudo()
        domain = self._consultation_domain()
        values = self._prepare_portal_layout_values()
        values.update({
            "consultation_count": consultations.search_count(domain),
            "recent_consultations": consultations.search(
                domain, order="create_date desc, id desc", limit=3
            ),
        })
        return request.render("portal.portal_my_home", values)

    @http.route("/my/profile", type="http", auth="user", website=True)
    def portal_my_profile(self, **kwargs):
        """Use Odoo's native, permission-aware partner update flow."""
        values = self._prepare_my_account_rendering_values(
            redirect="/my/profile", **kwargs
        )
        values["page_name"] = "profile"
        return request.render("website_vorevia.portal_my_profile", values)

    @http.route(
        ["/my/consultations", "/my/consultations/page/<int:page>"],
        type="http",
        auth="user",
        website=True,
        readonly=True,
    )
    def portal_my_consultations(self, page=1, sortby=None, **kwargs):
        consultations = request.env["vorevia.consultation"].sudo()
        sortings = {
            "date": {"label": _("Newest"), "order": "create_date desc, id desc"},
            "status": {"label": _("Status"), "order": "state asc, create_date desc, id desc"},
        }
        sortby = sortby if sortby in sortings else "date"
        url = "/my/consultations"
        url_args = {"sortby": sortby} if sortby != "date" else {}
        domain = self._consultation_domain()
        pager = portal_pager(
            url=url,
            total=consultations.search_count(domain),
            page=page,
            step=self._items_per_page,
            url_args=url_args,
        )

        values = self._prepare_portal_layout_values()
        values.update({
            "consultations": consultations.search(
                domain,
                order=sortings[sortby]["order"],
                limit=self._items_per_page,
                offset=pager["offset"],
            ),
            "default_url": url,
            "page_name": "consultations",
            "pager": pager,
            "searchbar_sortings": sortings,
            "sortby": sortby,
        })
        return request.render("website_vorevia.portal_my_consultations", values)

    @http.route(
        ["/my/consultations/<int:consultation_id>"],
        type="http",
        auth="user",
        website=True,
        readonly=True,
    )
    def portal_my_consultation(self, consultation_id, **kwargs):
        consultation = request.env["vorevia.consultation"].sudo().search(
            [("id", "=", consultation_id), *self._consultation_domain()],
            limit=1,
        )
        if not consultation:
            raise NotFound()

        values = self._prepare_portal_layout_values()
        values.update({
            "consultation": consultation,
            "page_name": "consultation",
        })
        return request.render("website_vorevia.portal_my_consultation", values)
