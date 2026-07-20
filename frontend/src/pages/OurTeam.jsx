import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Users, Linkedin, Twitter, Instagram, Globe, ChevronRight } from 'lucide-react';
import PageBanner from '../components/ui/PageBanner';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { teamService } from '../api/teamService';
import { getLocalImageUrl } from '../utils/imageMapper';

/* ── Skeleton ───────────────────────────────────────────────── */
const MemberSkeleton = () => (
  <div className="animate-pulse bg-white border border-[#eae8d8] p-6">
    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4" />
    <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2" />
    <div className="h-3 bg-gray-100 rounded w-24 mx-auto mb-1" />
    <div className="h-3 bg-gray-100 rounded w-20 mx-auto" />
  </div>
);

/* ── Member Card ────────────────────────────────────────────── */
const MemberCard = ({ member }) => {
  const imgSrc = member.image
    ? member.image.startsWith('http')
      ? member.image
      : getLocalImageUrl(member.image)
    : null;

  return (
    <div className="bg-white border border-[#eae8d8] p-6 text-center hover:shadow-md transition-shadow group">
      {/* Photo */}
      <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2 border-[#eae8d8] bg-[#f5f3e8]">
        {imgSrc ? (
          <img src={imgSrc} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="font-heading font-semibold text-black text-base mb-0.5">{member.name}</h3>
      <p className="text-xs font-bold text-[#8B5A2B] uppercase tracking-wider mb-1">{member.role}</p>
      <p className="text-xs text-gray-500 mb-3">{member.department}</p>

      {/* Bio */}
      {member.bio && (
        <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-3">{member.bio}</p>
      )}

      {/* Social Links */}
      {(member.socialLinks?.linkedin || member.socialLinks?.twitter || member.socialLinks?.instagram || member.socialLinks?.website) && (
        <div className="flex items-center justify-center gap-3">
          {member.socialLinks.linkedin && (
            <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-400 hover:text-[#0077b5] transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {member.socialLinks.twitter && (
            <a href={member.socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-gray-400 hover:text-black transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
          )}
          {member.socialLinks.instagram && (
            <a href={member.socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-[#e1306c] transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
          )}
          {member.socialLinks.website && (
            <a href={member.socialLinks.website} target="_blank" rel="noopener noreferrer" aria-label="Website" className="text-gray-400 hover:text-black transition-colors">
              <Globe className="w-4 h-4" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};

const OurTeam = () => {
  useDocumentTitle('Our Team - Fabish');
  const [members, setMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await teamService.getAll();
        if (res.success && res.data) {
          setMembers(res.data.members || []);
          setDepartments(res.data.departments || []);
        } else {
          setError(res.message || 'Failed to load team data');
        }
      } catch {
        setError('Could not connect to server. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const leadership = members.filter((m) => m.isFeatured);
  const filteredMembers = activeFilter === 'All'
    ? members.filter((m) => !m.isFeatured)
    : members.filter((m) => !m.isFeatured && m.department === activeFilter);

  const breadcrumbs = [{ label: 'Home', to: '/' }, { label: 'Our Team' }];

  return (
    <div className="w-full bg-[#faf9f5] font-body min-h-screen pb-24 text-left">
      <PageBanner title="Our Team" breadcrumbs={breadcrumbs} />

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-16">

        {loading ? (
          <>
            {/* Leadership skeleton */}
            <div className="mb-16">
              <div className="h-6 bg-gray-200 rounded w-40 mb-8 animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3].map((i) => <MemberSkeleton key={i} />)}
              </div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-40 mb-8 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => <MemberSkeleton key={i} />)}
            </div>
          </>
        ) : error ? (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-8">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <p>{error}</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-heading font-semibold text-gray-400 mb-2">Team members coming soon</h2>
            <p className="text-gray-400 text-sm">Our team page is being updated. Check back shortly.</p>
          </div>
        ) : (
          <>
            {/* Leadership Section */}
            {leadership.length > 0 && (
              <section className="mb-16">
                <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-[#8B5A2B] mb-8">Leadership</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {leadership.map((m) => <MemberCard key={m._id} member={m} />)}
                </div>
              </section>
            )}

            {/* Department Filter */}
            {departments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                <button
                  onClick={() => setActiveFilter('All')}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors cursor-pointer ${activeFilter === 'All' ? 'bg-black text-white border-black' : 'bg-white text-black border-[#eae8d8] hover:bg-[#f0ede0]'}`}
                >
                  All
                </button>
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setActiveFilter(dept)}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors cursor-pointer ${activeFilter === dept ? 'bg-black text-white border-black' : 'bg-white text-black border-[#eae8d8] hover:bg-[#f0ede0]'}`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            )}

            {/* Team Grid */}
            <section className="mb-16">
              {leadership.length > 0 && (
                <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-8">
                  {activeFilter === 'All' ? 'Our Departments' : activeFilter}
                </h2>
              )}
              {filteredMembers.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredMembers.map((m) => <MemberCard key={m._id} member={m} />)}
                </div>
              ) : (
                <div className="text-center py-16 bg-white border border-[#eae8d8]">
                  <p className="text-gray-400 text-sm">No team members found for this department.</p>
                </div>
              )}
            </section>

            {/* Careers CTA */}
            <div className="bg-[#f0ede0] border border-[#d9d4be] p-10 text-center">
              <h3 className="text-xl font-heading font-semibold text-black mb-2">Join Our Team</h3>
              <p className="text-sm text-gray-600 mb-6 max-w-[480px] mx-auto">
                We're always looking for passionate people to join the Fabish family. Reach out to us to explore opportunities.
              </p>
              <Link
                to="/pages/contact"
                className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#8B5A2B] transition-colors no-underline"
              >
                View Openings <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OurTeam;
