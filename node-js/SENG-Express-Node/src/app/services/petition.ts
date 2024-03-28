import {SupportTier} from "../models/support_tier.model";
import {Supporter} from "../models/supporter.model";
import {Petition} from "../models/petition.model";

function aggregateData(petitions: Petition[], supportTiers: SupportTier[], supporters: Supporter[]): Petition[] {
    const supportTiersByPetition: Map<number, SupportTier[]> = supportTiers.reduce((acc, tier) => {
        const tiers = acc.get(tier.petition_id) || [];
        tiers.push(tier);
        acc.set(tier.petition_id, tiers);
        return acc;
    }, new Map<number, SupportTier[]>());
    const supportersBySupportTier: Map<number, Supporter[]> = supporters.reduce((acc, supporter) => {
        const currentSupporters = acc.get(supporter.supportTierId) || [];
        currentSupporters.push(supporter);
        acc.set(supporter.supportTierId, currentSupporters);
        return acc;
    }, new Map<number, Supporter[]>());
    return petitions.map(petition => {
        const tiers = supportTiersByPetition.get(petition.id) || [];
        const tiersWithSupporters = tiers.map(tier => ({
            ...tier,
            supporterList: supportersBySupportTier.get(tier.id) || []
        }));
        const supportingCost = tiers.reduce((acc, tier) => acc + tier.cost, 0);
        return {
            ...petition,
            tierList: tiersWithSupporters,
            SupportingCost: supportingCost
        };
    });
}

interface FilterCriteria {
    q?: string;
    supportingCost?: number;
    ownerId?: number;
    supporterId?: number;
}

function filterPetitions(petitions: Petition[], criteria: FilterCriteria): Petition[] {
    return petitions.filter(petition => {
        if (criteria.q && !(petition.title.includes(criteria.q) || petition.description.includes(criteria.q))) {
            return false;
        }
        if (criteria.supportingCost !== undefined && petition.SupportingCost > criteria.supportingCost) {
            return false;
        }
        if (criteria.ownerId && petition.ownerId !== criteria.ownerId) {
            return false;
        }
        if (criteria.supporterId) {
            const hasSupporter = petition.tierList.some(tier =>
                tier.supporterList.some(supporter => supporter.userId === criteria.supporterId));
            if (!hasSupporter) {
                return false;
            }
        }
        return true;
    });
}

function sortPetitions(petitions: Petition[], sortBy: string): Petition[] {
    return petitions.sort((a, b) => {
        switch (sortBy) {
            case 'ALPHABETICAL_ASC':
                return a.title.localeCompare(b.title);
            case 'ALPHABETICAL_DESC':
                return b.title.localeCompare(a.title);
            case 'COST_ASC':
                return a.SupportingCost - b.SupportingCost;
            case 'COST_DESC':
                return b.SupportingCost - a.SupportingCost;
            case 'CREATED_ASC':
                return new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime();
            case 'CREATED_DESC':
                return new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime();
            default:
                return new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime();
        }
    });
}

function paginatePetitions(petitions: Petition[], startIndex: number, count: number): Petition[] {
    const endIndex = startIndex + count;
    return petitions.slice(startIndex, endIndex);
}

export {aggregateData, FilterCriteria, filterPetitions, sortPetitions, paginatePetitions}