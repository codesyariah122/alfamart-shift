<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShiftSwapResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id'        => $this->id,
            'requester' => $this->requester,
            'partner'   => $this->partner,
            'date'      => $this->date->format('Y-m-d'),
            'status'    => $this->status,
        ];
    }
}
