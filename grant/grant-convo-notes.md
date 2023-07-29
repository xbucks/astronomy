Question 1 (homepage):
- issues with updating to keep it on front (rule against it)
- find rule-breaking content
- will probably be fine

Question 2 (rules):
- no general advice
- depends on the site
- be unambiguous
- these rules are not comprehensive note
	- staff have final say

Question 3 (mod actions):
- mspfa actually has no moderation
	- database editing
- hasn't had to ip ban
- make sure ban keeps (but locks) account
- hash IPs (maybe salt?)

GDPR requires option to delete, not requiring deletion (?)

add user blocking

Question 4 (emails):
- don't fully understand, someone else did it
- used program that sends mail on ubuntu 
- node mailer

Question 5 (tos&pp):
- he just typed them
- probably not legally secure
	- but makes them think they're secure
- just looked up what to include/other sites
- if google: how to adsense

- how you use cookies
- what data you store
- PP: telling users what you do with their data
- TOS: what users can do with your site (legally)
- rules separate from TOS

- might be able to use tos/pp generator
- if you want to go big, get a lawyer

Question 6 (i18n):
- use translator (if necessary)
- rely on user reports

Question 7 (donations):
- costs aren't that much
- might need a backup server? might cost a little more
- use AWS S3 for storage?
	- only if website gets popular
	- cloudflare server side caching for things like pfps?
		- could save money if charges for bandwidth
	- even if you don't, use a separate server
		- so you don't run out of storage
- most of the money goes to storage, not domain or hosting
- you could pay for hosting with just about anything (so donations would probably work)

- if you can get unobtrusive ads, you can get a good amount of $$$ (but inconsistent)
	- MSPFA gets $400-700
	- loyal userbase makes money with ads
	- you can get emails from ad services (try those instead of adsense)
		- in theory, they'll make you more money
	- google: don't use auto-ads
		- make sure you don't run "experiments"
		- toggle of experiments/labs/etc.

- either patreon or ads should work


Misc. Tangent
- he recommends OVH for hosting
	- slow vCPUs
		- depends on site logic
	- you can get cheaper
	- right now MSPFA has 4gb and 4vcores
		- $9.29/mo
